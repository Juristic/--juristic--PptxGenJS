const fs = require('fs')
const path = require('path')

const sourceFolder = '../defaultContent'

// get folders from source folder
const folders = fs.readdirSync(sourceFolder)

const defaultFolderStructure = [
	{ _rels: [] },
	{ docProps: [] },
	{
		ppt: [
			{ _rels: [] },
			{
				charts: [{ _rels: [] }],
			},
			{ embeddings: [] },
			{ media: [] },
			{
				slideLayouts: [
					{
						_rels: [],
					},
				],
			},
			{
				slideMasters: [
					{
						_rels: [],
					},
				],
			},
			{
				slides: [
					{
						_rels: [],
					},
				],
			},
			{ theme: [] },
			{
				notesMasters: [
					{
						_rels: [],
					},
				],
			},
			{
				notesSlides: [
					{
						_rels: [],
					},
				],
			},
		],
	},
]

const defaultFolders = [
	'_rels',
	'docProps',
	'ppt',
	'ppt/_rels',
	'ppt/charts',
	'ppt/charts/_rels',
	'ppt/embeddings',
	'ppt/media',
	'ppt/slideLayouts',
	'ppt/slideLayouts/_rels',
	'ppt/slideMasters',
	'ppt/slideMasters/_rels',
	'ppt/slides',
	'ppt/slides/_rels',
	'ppt/theme',
	'ppt/notesMasters',
	'ppt/notesMasters/_rels',
	'ppt/notesSlides',
	'ppt/notesSlides/_rels',
]

function getFilesByStructure(dir) {
	const filesByStructure = []

	function processDirectory(dirPath, currentObject) {
		const files = fs.readdirSync(dirPath)

		files.forEach(file => {
			const filePath = path.join(dirPath, file)
			if (fs.statSync(filePath).isDirectory()) {
				currentObject[file] = {}
				processDirectory(filePath, currentObject[file])
			} else {
				currentObject[file] = []
			}
		})
	}

	processDirectory(dir, filesByStructure)
	return filesByStructure
}

async function createZipStructure(structure, currentFolder) {
	if (!currentFolder) {
		currentFolder = null //new JSZip();
	}

	await Promise.all(
		structure.map(async item => {
			const [name, contents] = Object.entries(item)[0]
			if (Array.isArray(contents)) {
				const subfolder = currentFolder.folder(name)
				await createZipStructure(contents, subfolder)
			} else if (typeof contents === 'object') {
				const subfolder = currentFolder.folder(name)
				await createZipStructure([contents], subfolder)
			} else {
				const fileContent = fs.readFileSync(name, 'utf-8')
				currentFolder.file(name, fileContent)
			}
		})
	)

	return currentFolder
}

console.log(getFilesByStructure(sourceFolder))
