const moment = require("moment")
const path = require("path")
const Request = require("../../utils/request.js")
const Common = require("../../utils/common.js")
const readline = require("readline")

var productIds = []

const getConfimProductUrls = async ()=>{
	let res = await Request({
		url:"/du/self/getConfimProductUrls"
	})
	return res['data'];
}

const getConfimProductIds = async ()=>{
	let res = await Request({
		url:"/du/self/getConfimProductIds"
	})
	return res["data"]
}

const writeAlreadyDumpIds = async ids=>{
	await Common.writeFile(path.resolve(
		__dirname,"context/alreadyDumpDetailProductIds.json"),
		ids
	)
}

const readAlreadyDumpIds = async ()=>{
	let productIds = await Common.readFile(path.resolve(
		__dirname,"context/alreadyDumpDetailProductIds.json"))
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
			} else {
				process.exit(1)
			}
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
		response = JSON.parse(response)
		if ( response["status"] != 200 ) continue
		let datas = response["data"]
		let detail = {}
		let sku = datas["detail"]["articleNumber"].toString().toUpperCase().trim()
		if ( sku.indexOf(' ') !== -1 ) {
			sku.replace(' ','-')
		}

		let price = "--"
		if ( datas["item"]["price"] && typeof parseInt(datas["item"]["price"]) === "number" ) {
			price = parseInt(datas["item"]["price"]) / 100
		}

		let sizeList = {}
		datas["sizeList"].forEach(sizeDetail=>{
			let size = sizeDetail["size"]
			let sizePrice = "--"
			if ( sizeDetail["item"] && !Array.isArray(sizeDetail["item"]) && sizeDetail["item"]["price"] ) {
				sizePrice = parseInt(sizeDetail["item"]["price"]) / 100
			}
			sizeList[size] = sizePrice
		})

		detail["sku"] = sku
		detail["item_id"] = datas["item"]["productItemId"]
		detail["price"] = price
		detail["product_id"] = productId
		detail["title"] = datas["detail"]["title"]
		detail["size_list"] = JSON.stringify(sizeList)
		detail["sold_total"] = datas["detail"]["soldNum"]
		detail["sell_date"] = datas["detail"]["sellDate"]
		detail["create_at"] = moment().format("YYYY-MM-DD")
		await Request({
			url:"/du/self/putProductDetail",
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
	let confimProductUrls = await getConfimProductUrls()
	let confimProductIds = await getConfimProductIds()
	let alreadyDumpProductIds = await readAlreadyDumpIds()
	await checkRestartDump(confimProductIds.length,alreadyDumpProductIds.length)
	let buildedProducts = await buildIndexById(confimProductUrls)
	let filterProducts = await filterProductIds(buildedProducts)
	await putProductDetails(filterProducts)
})()














