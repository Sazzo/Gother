const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state-core.js')

const googleApi = require('../keys/google-search.json')

async function image() {
  const busca = state.load()

  await getImagesOfAllSentences(busca)
  await downloadAllImages(busca)

  state.save(busca)

  async function getImagesOfAllSentences(busca) {
    for (const sentence of busca.sentences) {
      const query = `${busca.searchTerm} ${sentence.keywords[0]}`
      sentence.images = await getGoogleAndReturnImagesLinks(query)

      sentence.googleSearchQuery = query
    }
  }

  async function getGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleApi.apikey,
      cx: googleApi.searchID,
      q: query,
      searchType: 'image',
      num: 2
    })

    const imagesUrl = response.data.items.map((item) => {
      return item.link
    })

    return imagesUrl
  }

  async function downloadAllImages(busca) {
    busca.downloadedImages = []

    for (let sentenceIndex = 0; sentenceIndex < busca.sentences.length; sentenceIndex++) {
      const images = busca.sentences[sentenceIndex].images

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex]

        try {
          if (busca.downloadedImages.includes(imageUrl)) {
            throw new Error('Imagem já foi baixada')
          }

          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
          busca.downloadedImages.push(imageUrl)
          console.log(`> [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
          break
        } catch(error) {
          console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
        }
      }
    }
  }

  async function downloadAndSave(url, fileName) {
    return imageDownloader.image({
      url, url,
      dest: `./content/${fileName}`
    })
  }

}

module.exports = image