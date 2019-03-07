const fs = require("fs")
const moment = require("moment")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const config = require("../../config.js")
const redis = database.getRedis()

exports.getAlreadyCaptureProductId = async type=>{
	let productIds = []
 	switch (type) {
 		case "list":
 			productIds = await redis.get("du/self/alreadyCaptureByListProductIds")
 			break;
 		case "detail":
 			productIds = await redis.get("du/self/alreadyCaptureByDetailProductIds")
 			break;
 		case "sold":
 			productIds = await redis.get("du/self/alreadyCaptureBySoldProductIds")
 			break;
 	}

 	if ( productIds === null ) {
		productIds = []
	} else {
		productIds = JSON.parse(productIds) 
	}
	return productIds
}

exports.setAlreadyCaptureProductId = async (type,productId)=>{
	let productIds = []
 	let setKey = ""

	switch (type) {
 		case "list":
 			productIds = await redis.get("du/self/alreadyCaptureByListProductIds")
 			setKey = "du/self/alreadyCaptureByListProductIds"
 			break;
 		case "detail":
 			productIds = await redis.get("du/self/alreadyCaptureByDetailProductIds")
 			setKey = "du/self/alreadyCaptureByDetailProductIds"

 			break;
 		case "sold":
 			productIds = await redis.get("du/self/alreadyCaptureBySoldProductIds")
 			setKey = "du/self/alreadyCaptureBySoldProductIds"
 			break;
 	}

 	if ( productIds === null ) {
		productIds = [productId]
	} else {
		productIds = JSON.parse(productIds)
		if ( !productIds.includes(productId) )	productIds.push(productId)
	}
	await redis.set(setKey,JSON.stringify(productIds))
}

exports.cleanAlreadyCaptureProductId = async type=>{
	let setKey = ""
 	switch (type) {
 		case "list":
 			setKey = "du/self/alreadyCaptureByListProductIds"
 			break;
 		case "detail":
 			setKey = "du/self/alreadyCaptureByDetailProductIds"

 			break;
 		case "sold":
 			setKey = "du/self/alreadyCaptureBySoldProductIds"
 			break;
 	}
 	await redis.set(setKey,JSON.stringify([]))
}



exports.getCurrentCaptureProduct = async (sign=1)=>{
	let product = await redis.get(`du/currentCaptureProduct${sign}`)
	if ( product === null ) {
		product = {}
	} else {
		product = JSON.parse(product)
	}
	return product;
}

exports.setCurrentCaptureProduct = async (product,sign=1)=>{
	await redis.set(`du/currentCaptureProduct${sign}`,JSON.stringify(product))
}

exports.cleanCurrentCaptureProduct = async (sign=1)=>{
	await redis.set(`du/currentCaptureProduct${sign}`,JSON.stringify({}))
}


exports.getCurrentCaptureIndex = async (sign=1)=>{
	let idx = await redis.get(`du/currentCaptureIndex${sign}`)
	if ( idx === null ) {
		idx = 0
	} else {
		idx = parseInt(idx)
	}
	return idx
}

exports.setCurrentCaptureIndex = async (idx,sign=1)=>{
	await redis.set(`du/currentCaptureIndex${sign}`,idx)
}

exports.cleanCurrentCaptureIndex = async (sign=1)=>{
	await redis.set(`du/currentCaptureIndex${sign}`,0)
}


exports.getNeedCaptureProducts = async (sign=1)=>{
	let products = await redis.get(`du/needCaptureProducts${sign}`)
	if ( products === null ) {
		products = [] 
	} else {
		products = JSON.parse(products)
	}
	return products
}

exports.setNeedCaptureProducts = async (products,sign=1)=>{
	await redis.set(`du/needCaptureProducts${sign}`,JSON.stringify(products))
}

exports.cleanNeedCaptureProducts = async (sign=1)=>{
	await redis.set(`du/needCaptureProducts${sign}`,JSON.stringify([]))
}


exports.getSoldDetail = async ()=>{
	let soldDetail = await redis.get("du/soldDetail")
	if ( soldDetail === null ) {
		soldDetail = {}
	} else {
		soldDetail = JSON.parse(soldDetail)
	}
	return soldDetail
}

exports.setSoldDetail = async soldDetail=>{
	await redis.set("du/soldDetail",JSON.stringify(soldDetail))
}

exports.cleanSoldDetail = async ()=>{
	await redis.set("du/soldDetail",JSON.stringify({}))
}








exports.readyStartRobot = async ()=>{
	await robot.clickWindowWhite()
}

exports.searchSkuRobot = async product=>{
	let sku = product["sku"]
	let productId = product["product_id"]
	console.log(`[Notice]: 当前货号: ${sku}`)
	console.log(`[Notice]: 当前产品id: ${productId}`)
	await exports.setCurrentCaptureProduct(product)
	await robot.clickSearchInput()
	await common.awaitTime(500)
	await robot.inputContent(sku)
	await common.awaitTime(500)
	await robot.clickEnter()
}

exports.cleanSkuRobot = async ()=>{
	await robot.clickSearchInput()
	await common.awaitTime(300)
	await robot.clickCleanButton()
}
 

exports.rollSoldRobot = async ()=>{
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
}

exports.parseSold = async (dateStrings=[],dateScope=null)=>{
	let currentDate = moment().format("YYYY-MM-DD")
	let soldDetail = await exports.getSoldDetail()

	if ( dateScope === null && config["soldDateScope"] ) {
		dateScope = config["soldDateScope"]
	}
	if ( dateScope === null ) { 
		dateScope = 1
	}
	if ( typeof dateScope === "string" && dateScope.includes("-") ) {
		dateScope = moment(currentDate).diff(dateScope,'day')
	}
	if ( dateStrings.length === 0 ) return {}

	if ( dateStrings.length > 0 ) {
		for ( let [idx,content] of dateStrings.entries() ) {
			let dateString = content["time"]
			let size = parseFloat(content["size"])
			let date = common.parseDateString(dateString)
			let {diff,format} = date
			if ( diff === 0 ) continue
			if ( diff<=dateScope ) {
				if ( !soldDetail[format] ) soldDetail[format] = {}
				if ( !soldDetail[format][size] ) {
					soldDetail[format][size] = 1
				} else {
					soldDetail[format][size] += 1
				}
				await exports.setSoldDetail(soldDetail)
			} else {
				return soldDetail
			}
		}
	}
	return null
}