const readline = require('readline-sync')
const state = require('./state-core.js')
async function input() {
	const busca = {
		maxSetences: 7
	}



	// Selecionador

	busca.termo = buscaDoTermoSelecionado()
	busca.prefixo = prefixoDoTermoSelecionado()
	state.save(busca)


	function buscaDoTermoSelecionado() {
		return readline.question('Por favor, coloque um termo para eu pesquisar na wikipedia:')
	}

	function prefixoDoTermoSelecionado() {
		const prefixos = ['Quem [é]?', 'Oque [é]?', 'A historia de']
		const selectedPrefix = readline.keyInSelect(prefixos, 'Escolha uma opção:')
		const selectedPrefixTo = prefixos[selectedPrefix]

		return selectedPrefixTo

	}
}

module.exports = input

