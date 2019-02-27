const fs = require("fs")
const path = require("path")
const koaRouter = require("koa-router")
const common = require("./utils/common.js")
const routesDirectoryPath = path.resolve(__dirname,"./routes")
const router = new koaRouter()

const getFileList = async (directoryPath)=>{
	return await common.readDirectory(directoryPath)
}

const getAbsolutePath = (name,baseDirectoryPath=null) => {
	if ( baseDirectoryPath === null ) {
		return `${routesDirectoryPath}/${name}`	
	} else {
		return `${baseDirectoryPath}/${name}`
	}
}

const handleFileList = async (fileList,baseDirectoryPath=null) => {
	for ( let [idx,name] of fileList.entries() ) {
		let absolutePath = getAbsolutePath(name,baseDirectoryPath)
		if ( absolutePath.indexOf(".js") === -1 ) {
			let childFileList = await getFileList(absolutePath)
			await handleFileList(childFileList,absolutePath)
		} else {
			let routerFileContent = require(absolutePath)
			addRouter(absolutePath,routerFileContent)
		}	
	}
}

const addRouter = (routerFilePath,routerFileContent)=>{
	let routerBasePath = routerFilePath.replace(routesDirectoryPath,"")
	routerBasePath = routerBasePath.replace(".js","")

	if ( routerFileContent["get"] && Object.keys(routerFileContent["get"]).length > 0 ) {
		for( let [funcName,funcContent] of Object.entries(routerFileContent["get"]) ) {
			let routerPath = `${routerBasePath}/${funcName}`
			router.get(routerPath,funcContent)
		}
		
	}
	if ( routerFileContent["post"] && Object.keys(routerFileContent["post"]).length > 0 ) {
		for( let [funcName,funcContent] of Object.entries(routerFileContent["post"]) ) {
			let routerPath = `${routerBasePath}/${funcName}`
			router.post(routerPath,funcContent)
		}
	}
}


module.exports = async ()=>{
	let fileList = await getFileList(routesDirectoryPath)
	await handleFileList(fileList)
	return router
}





