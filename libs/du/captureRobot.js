const fs = require("fs")
const moment = require("moment")
const config = require("../../config.js")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const utils = require("./utils.js")
const redis = database.getRedis()

exports.start = async (products,sign=1)=>{
	let idx = 0
	await utils.setCurrentCaptureIndex(idx)
	await utils.setNeedCaptureProducts(products,sign)
	await utils.setCurrentCaptureProduct(products[idx],sign)
	await utils.readyStartRobot()
	await utils.searchSkuRobot(products[idx])
}

exports.handleList = async (listString,sign=1)=>{
	let list = response.parseProductList(listString)
	let products = await utils.getNeedCaptureProducts(sign)
	let idx = await utils.getCurrentCaptureIndex(sign)
	let product = products[idx]

	await common.awaitTime(1200)
	if ( list.length > 0 ) {
		await robot.clickDetail(1)
	} else {
		await utils.setAlreadyCaptureProductId("sold",product["product_id"])
		idx += 1
		await utils.setCurrentCaptureIndex(idx,sign)
		await utils.cleanSkuRobot()
		await common.awaitTime(500)
		await utils.searchSkuRobot(products[idx])
	}
}

exports.handleDetail = async (detailString,sign=1)=>{
	let detail = response.parseProductDetail(detailString)
	let products = await utils.getNeedCaptureProducts(sign)
	let idx = await utils.getCurrentCaptureIndex(sign)
	let product = products[idx]

	await common.awaitTime(1200)
	if ( detail["sold_total"] <= 5 ) {
		await robot.clickBack();
		await common.awaitTime(2000)
		await utils.cleanSkuRobot()
		await utils.setAlreadyCaptureProductId("sold",product["product_id"])
		idx += 1
		await utils.setCurrentCaptureIndex(idx,sign)
		await common.awaitTime(500)
		await utils.searchSkuRobot(products[idx])

	} else {
		await robot.clickTotalSold()
	}

}

exports.handleSold = async (soldString,sign=1)=>{
	let sold = response.parseProductSold(soldString)
	let products = await utils.getNeedCaptureProducts(sign)
	let idx = await utils.getCurrentCaptureIndex(sign)
	let soldDetail = await utils.getSoldDetail()
	let product = products[idx]
	let productId = product["product_id"]
	
	if ( Object.keys(soldDetail).length === 0 ) {
		await common.awaitTime(1200)	
	}

	let res = await utils.parseSold(sold)
	if ( res === null ) {
		await robot.rollWindow()
		await common.awaitTime(300)
		await robot.rollWindow()
	} else {
		await utils.cleanSoldDetail(sign)
		res = JSON.stringify(res)
		await request({
			method:"post",
			url:"/du/self/setProductSoldDetail",
			data:{
				productId,
				soldDetail:res,
			}
		})

		await utils.setAlreadyCaptureProductId("sold",productId)
		idx += 1
		await utils.setCurrentCaptureIndex(idx,sign)
		await robot.clickBack();
		await common.awaitTime(2000)
		await robot.clickBack();
		await common.awaitTime(2000)
		await utils.cleanSkuRobot()
		await common.awaitTime(500)
		await utils.searchSkuRobot(products[idx])
	}
}



