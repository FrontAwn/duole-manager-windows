const fs = require("fs")
const path = require("path")
const config = require("../../config.js")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const utils = require("./utils.js")
const redis = database.getRedis()
const cache = require("./cache.js")


var currentProcessId = null
const type = config["soldConfig"]["type"]

const getCurrentProcessId = async ()=>{
	let processContent = await common.readFile(path.resolve(__dirname,"../../json/ruleProcess.json"))
	return JSON.parse(processContent.toString())["processId"]
}

const getCaptureProduct = async (next=true)=>{
	let product = null
	let key = ""
	let processId = null
	if ( currentProcessId !== null ) {
		processId = currentProcessId
	} else {
		processId = await getCurrentProcessId()
	}
	if ( next ) {
		key = "needCaptureProducts"
		product = await cache.popCacheLinked(type,0,key)
		if ( product !== null ) {
			await cache.setCacheHasMap(type,processId,"currentCaptureProduct",product)
		} else {
			await cache.delCacheHasMap(type,processId,"currentCaptureProduct")
			console.log('[Notice]: 没有更多货号，请重新抓取')
			process.exit()
		}
	} else {
		key = "currentCaptureProduct"
		product = await cache.getCacheHasMap(type,processId,key)
	}
	return JSON.parse(product)
}

exports.start = async ()=>{
	await getCurrentProcessId()
	await cache.delCacheHasMap(type,processId,"currentCaptureSoldDetail")
	await utils.readyStartRobot()
	let product = await getCaptureProduct(false)
	if ( product === null ) {
		product = await getCaptureProduct(true)
	}

	await utils.searchSkuRobot(product)
}

exports.handleList = async (listString,url)=>{
	let list = response.parseProductList(listString)
	url = common.urlParse(url)
	let query = common.qsParse(url["query"])
	let sku = query["title"]
	let next = false
	await common.awaitTime(1200)
	if ( list.length > 0 ) {
		await robot.clickDetail(1)
	} else {
		if ( sku.length <= 12 ) {
			next = true
		}
		let product = await getCaptureProduct(next)
		await utils.cleanSkuRobot()
		await common.awaitTime(500)
		await utils.searchSkuRobot()
	}
}

exports.handleDetail = async (detailString,sign=1)=>{
	let detail = response.parseProductDetail(detailString)
	await common.awaitTime(1200)
	if ( detail["sold_total"] <= 5 ) {
		await robot.clickBack();
		await common.awaitTime(2000)
		await utils.cleanSkuRobot()
		let product = await getCaptureProduct(true)
		await common.awaitTime(500)
		await utils.searchSkuRobot(product)
	} else {
		await robot.clickTotalSold()
	}

}

exports.handleSold = async (soldString,sign=1)=>{
	let sold = response.parseProductSold(soldString)
	let processId = await getCurrentProcessId()
	let soldDetail = await cache.getCacheHasMap(type,processId,"currentCaptureSoldDetail")
	let currentProduct = await getCaptureProduct(false)
	let productId = currentProduct["product_id"]
	if ( soldDetail === null ) {
		await common.awaitTime(1200)
	} 
	let res = await utils.parseSold(sold,type,processId)
	if ( res === null ) {
		await robot.rollWindow()
		await common.awaitTime(300)
		await robot.rollWindow()
	} else {
		let soldDetail = JSON.stringify(res)
		let url = config["soldConfig"]["saveUrl"]
		await request({
			method:"post",
			url,
			data:{
				productId,
				soldDetail:res,
			}
		})
		await robot.clickBack();
		await common.awaitTime(2000)
		await robot.clickBack();
		await common.awaitTime(2000)
		await utils.cleanSkuRobot()
		await common.awaitTime(500)
		await cache.delCacheHasMap(type,processId,"currentCaptureSoldDetail")
		let nextProduct = await getCaptureProduct(true)
		await utils.searchSkuRobot(nextProduct)
	}
}



