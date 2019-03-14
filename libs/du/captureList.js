const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const common = require("../../utils/common.js")
const config = require("../../config.js")

const getRequestParmas = type=>{
	let host = "https://m.poizon.com/search/list?"
	let query = {
		size:"[]",
		title:"",
		typeId:0,
		catId:0,
		unionId:0,
		sortType:0,
		sortMode:1,
		page:0,
		limit:20
	}

	switch (type) {
		case "nike":
			query["unionId"] = 144
			break;
		case "jordan":
			query["unionId"] = 13
			break;
		case "adidas":
			query["unionId"] = 3
			break;
		case "adidasOriginal":
			query["catId"] = 3
			query["unionId"] = 494
			break;
	}

	return { host,query }

}


const handleTypeBySku = async (requestParams,products,getCaptureList,captureAfter)=>{
	let { host, query } = requestParams;
	for ( let [idx,content] of products.entries() ) {
		let sku = content["sku"]
		query["title"] = sku
		let url = `${host}${common.qsStringify(query)}`
		let res = await common.httpsGet(url)
		let list = response.parseProductList(res)
		await getCaptureList(list,sku)
	}
	console.log(`[Notice]: 抓取完毕，没有更多的数据可以抓取`)
	if ( captureAfter !== null && typeof captureAfter === "function" ) {
		await captureAfter()
	}
}

const handleTypeByDefault = async (requestParams,getCaptureList,captureAfter)=>{
	let { host, query } = requestParams;
	let page = 0
	let state = true

	while (state) {
		query["page"] = page
		let url = `${host}${common.qsStringify(query)}`
		let res = await common.httpsGet(url)
		let list = response.parseProductList(res)	
		if ( list.length > 0 ) {
			await getCaptureList(list)
			page += 1
			await common.awaitTime(500)
			// state = false
		} else {
			console.log(`[Notice]: 抓取完毕，没有更多的数据可以抓取`)
			if ( captureAfter !== null && typeof captureAfter === "function" ) {
				await captureAfter()
			}
			state = false
		}
	}
	
}

module.exports = async options=>{

	let captureBefore = options.captureBefore || null

	let captureAfter = options.captureAfter || null

	let captureType = options.captureType || null

	let captureSign = options.captureSign || config["signEnv"]

	let setCaptureProducts = options.setCaptureProducts || null

	let getCaptureList = options.getCaptureList || null

	if ( captureBefore !== null && typeof captureBefore === "function" ) {
		await captureBefore()
	}

	if ( captureType === null ) {
		console.log(`[Error]: 必须传入captureType属性参数，表明要抓取的类型[self | nike | jordan | adidas | adidasOriginal]`)
		process.exit()
	}

	if ( !captureSign ) {
		console.log(`[Error]: 没有发现sign参数，请设置config["signEnv"]或者直接传入captureSign属性参数`)
		process.exit()
	}

	if ( getCaptureList === null || typeof getCaptureList !== "function" ) {
		console.log(`[Error]: 必须传入getCaptureList属性，并且必须是函数类型，用来接受抓取处理后的数据list`)
		process.exit()
	}

	let requestParams = getRequestParmas(captureType);

	switch (captureType) {
		case "self":
			if ( setCaptureProducts === null || typeof setCaptureProducts !== "function" ) {
				console.log(`[Notice]: 如果类型为self，必须传入setCaptureProducts属性函数返回需要抓取的products`)
				process.exit()
			}
			let products = await setCaptureProducts()
			await handleTypeBySku(requestParams,products,getCaptureList,captureAfter)
			break;
		default:
			await handleTypeByDefault(requestParams,getCaptureList,captureAfter)
			break;
	}
}



