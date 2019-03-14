const fs = require("fs")
const path = require("path")
const moment = require("moment")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const config = require("../../config.js")
const utils = require("./utils.js")

var getSign = null 

const getRequestUrl = async (productId,lastId=null)=>{
	let host = "http://m.poizon.com/mapi/product/lastSoldList?"
	let query = {
		"limit":20,
		productId,
	}
	if ( lastId !== null ) {
		query["lastId"] = lastId
	} else {
		query["lastId"] = ""
	}
	query["sign"] = await getSign(query)

	let url = `${host}${common.qsStringify(query)}`

	return url
}



module.exports = async (options)=>{

	getSign = await utils.getParseSignFunction()

	let state = true
	let product = options["product"] || null
	let getProductSold = options["getProductSold"] || null
	let captureAfter = options["captureAfter"] || null

	if ( product === null ) {
		console.log("[Notice]: 请传入要抓取的product")
		process.exit()
	}

	if ( getProductSold === null || typeof getProductSold !== "function" ) {
		console.log(`[Notice]: 请传入getProductSold属性函数来接受请求结果`)
		process.exit()
	}

	let productId = product["product_id"]
	let sku = product["sku"]
	let lastId = product["lastId"]

	while (state) {
		let url = await getRequestUrl(productId,lastId)
		console.log(`----->[Request Url] : ${url}`)
		await common.awaitTime(500)

		let res = await common.httpGet(url)

		let soldDetail = response.parseProductSold(res)

		state = await getProductSold(soldDetail["list"],lastId)

		lastId = soldDetail["lastId"]

	}

	if ( captureAfter !== null && typeof captureAfter === "function" ) {
		await captureAfter()
	}

}









