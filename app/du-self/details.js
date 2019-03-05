const path = require("path")
const moment = require("moment")
const readline = require("readline")
const Request = require("../../utils/request.js")
const Response = require("../../utils/response.js")
const Common = require("../../utils/common.js")

var productIds = []
const alreadDumpIdsJsonPath = path.resolve(__dirname,"json/alreadyDumpIds.json")

const checkHasNewSkus = async ()=>{
	let where = {
		type:0
	}
	let attrs = ["sku"]
	let res = await Request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where),
			attrs:JSON.stringify(attrs)
		}
	})
	let datas = res["data"]
	if ( datas && datas.length > 0 ) {
		console.log(`[Warning]: 当前有${datas.length}个新货号需要处理，请先处理新货号`)
		process.exit(1)
	}
}

const getConfimProductUrls = async ()=>{
	let where = {
		type:2,
		url:{
			"$ne":""
		}
	}
	let attrs = ["url"]
	let res = await Request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where),
			attrs:JSON.stringify(attrs)
		}
	})
	let urls = []
	res['data'].forEach(content=>{
		urls.push(content.url)
	})
	return urls;
}

const getConfimProductIds = async ()=>{
	let where = {
		type:2,
	}
	let attrs = ['product_id']
	let res = await Request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where),
			attrs:JSON.stringify(attrs)
		}
	})
	let ids = []
	res['data'].forEach(content=>{
		ids.push(content['product_id'])
	})
	return ids
}

const writeAlreadyDumpIds = async ids=>{
	await Common.writeFile(alreadDumpIdsJsonPath,ids)
}

const readAlreadyDumpIds = async ()=>{
	let productIds = await Common.readFile(alreadDumpIdsJsonPath)
	return JSON.parse(productIds.toString())
}


const checkRestartDump = async (confimProductIdsLength,alreadyDumpProductIdsLength)=>{
	if ( confimProductIdsLength === alreadyDumpProductIdsLength ) {
		const commandLine = readline.createInterface({
			input:process.stdin,
			output:process.stdout
		})
		commandLine.question(`[Notice] 当天数据已经抓去一轮完成，是否重新抓去?(y/n): `,async answer=>{
			if ( answer === "y" || answer === "Y" ) {
				await writeAlreadyDumpIds(JSON.stringify([]))
			} 
			process.exit()
		})
	} 
}

const filterProductIds = async buildedProducts =>{
	let alreadDumpIds = await readAlreadyDumpIds()
	productIds = Common.deepCopy(alreadDumpIds)
	if ( alreadDumpIds.length === 0 ) return buildedProducts
	let productUrls = Common.deepCopy(buildedProducts)
	alreadDumpIds.forEach(id=>{
		if ( productUrls[id] ) {
			delete productUrls[id]
		}
	})
	return productUrls
}

const buildIndexById = urls=>{
	let res = {}
	urls.forEach(url=>{
		let urlObject = Common.urlParse(url)
		let qsObject = Common.qsParse(urlObject["query"])
		let productId = qsObject["productId"]
		res[productId] = url
	})
	return res
}

const putProductDetails = async urls =>{
	let totalLength = Object.keys(urls).length
	let currentIdx = 0
	for ( let [productId,url] of Object.entries(urls) ) {
		let response = await Common.httpGet(url)
		let detail = Response.parseProductDetail(response)
		if ( detail === null ) continue
		await Request({
			url:"/du/self/putConfimSkuDetail",
			data:{
				detail:JSON.stringify(detail),
			}
		})
		productIds.push(productId)
		await writeAlreadyDumpIds(JSON.stringify(productIds))
		currentIdx += 1
		console.log(`----------> 已经完成[ ${currentIdx}/${totalLength} ] `)
		await Common.awaitTime(300)
	}
}


;(async ()=>{
	await checkHasNewSkus()
	let confimProductUrls = await getConfimProductUrls()
	let confimProductIds = await getConfimProductIds()
	let alreadyDumpProductIds = await readAlreadyDumpIds()
	await checkRestartDump(confimProductIds.length,alreadyDumpProductIds.length)
	let buildedProducts = await buildIndexById(confimProductUrls)
	let filterProducts = await filterProductIds(buildedProducts)
	await putProductDetails(filterProducts)
})()














