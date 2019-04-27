const readline = require('readline-sync')
const modulos = {
	text: require('./modulos/module-text.js'),
	input: require('./modulos/module-input.js'),
	state: require('./modulos/state-core.js'),
	image: require('./modulos/module-image.js')
}

async function start() {

	modulos.input()
	await modulos.text()
	await modulos.image()

	const content = modulos.state.load()
	console.dir(content, { depth: null })
}

start()

// FelipeSazz. 2019