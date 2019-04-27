const algorithmia = require('algorithmia')
const key = require('../keys/algorithmia.json')
const sbd = require('sbd')
const watsonAPI = require('../keys/watson-nlu.json').apikey
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonAPI,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state-core.js')

async function text() {
	const busca = state.load()

	await getContentWikiPedia(busca)
	clearAllWrongCharacters(busca)
	goToBreakWrong(busca)
	limitSetences(busca)
	await getAllKeywordsOfAllSentences(busca)

	state.save(busca)

	// Vai pegar o content da Wikipedia usando async/await.
	async function getContentWikiPedia(busca) {
		const algorithmiaAPI = algorithmia(key.apiKey)
		const wikiAlgorithmia = algorithmiaAPI.algo('web/WikipediaParser/0.1.2')
		const wikiResposta = await wikiAlgorithmia.pipe(busca.termo)
		const resultadoWiki = wikiResposta.get()

		busca.getSourceContent = resultadoWiki.content

	}
	// Vai retirar linhas vazias, markdown e datas que tem ()
	function clearAllWrongCharacters(busca) {
	const breakBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(busca.getSourceContent)
    const breakDates = removeDates(breakBlankLinesAndMarkdown)

	busca.getSourceCorrect = breakDates

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const breakBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return breakBlankLinesAndMarkdown.join(' ')
    }
  }

  function removeDates(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function goToBreakWrong(text) {
  	busca.sentences = []

  	const sentences = sbd.sentences(busca.getSourceContent)
  	sentences.forEach((sentence) => {
  		busca.sentences.push({
  			text: sentence,
  			keywords: [],
  			images: []
  		})
  	})
  }

  async function getAllKeywordsOfAllSentences(busca) {
  	for (const sentence of busca.sentences) {
  		sentence.keywords = await getWatsonAndReturnKeywords(sentence.text)
  	}
  }

  function limitSetences(text) {
  	busca.senteces = busca.sentences.slice(0, busca.maxSetences)
  }

  // Watson Keywords

async function getWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          throw error
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }


}

module.exports = text