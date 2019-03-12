const fs = require("fs")
const path = require("path")
const moment = require("moment")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const config = require("../../config.js")
const cache = require("./cache.js")



exports.readyStartRobot = async ()=>{
	await robot.clickWindowWhite()
}

exports.searchSkuRobot = async (product,type)=>{
	let sku = product["sku"]
	let productId = product["product_id"]
	// console.log(`[Notice]: 当前货号: ${sku}`)
	// console.log(`[Notice]: 当前产品id: ${productId}`)
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
}

exports.parseSold = async (dateStrings=[],type,processId)=>{
	let currentDate = moment().format("YYYY-MM-DD")
	let soldDetail = await cache.getCacheHasMap(type,processId,"currentCaptureSoldDetail")
	if ( soldDetail === null ) {
		soldDetail = {}
	} else {
		soldDetail = JSON.parse(soldDetail)
	}
	let dateScope = config["soldConfig"]["dateScope"]


	if ( typeof dateScope === "string" && dateScope.includes("-") ) {
		dateScope = moment(currentDate).diff(dateScope,'day')
	}
	if ( dateStrings.length === 0 ) return {}

	if ( dateStrings.length > 0 ) {
		for ( let [idx,content] of dateStrings.entries() ) {
			let dateString = content["time"]
			let size = ""
			if ( isNaN(parseFloat(content["size"])) ) {
				size = content["size"]
			} else {
				size = parseFloat(content["size"])
			}
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
				await cache.setCacheHasMap(type,processId,"currentCaptureSoldDetail",JSON.stringify(soldDetail))
			} else {
				return soldDetail
			}
		}
	}
	return null
}