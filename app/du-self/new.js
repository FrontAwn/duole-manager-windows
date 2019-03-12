const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureCache = require("../../libs/du/cache.js")
const CaptureList = require("../../libs/du/captureList.js")
const sign = require("../../config.js")["signEnv"]

var newProducts = null
var captureList = {}

const captureBefore = async ()=>{
	let conditions = {
		where:JSON.stringify({type:0})
	}
	let res = await request({
		url:"/du/self/getProductList",
		data:conditions
	})

	if ( res["data"].length === 0 ) {
		console.log(`[Notice]: 当前没有新货号可以抓取`)
		process.exit()
	} else {
		newProducts = common.deepCopy(res["data"])
	}
}

const setCaptureProducts = async ()=>{
	return newProducts
}

const getCaptureList = async (list,sku)=>{
	let productIds = []
	if ( list.length > 0 ) {
		list.forEach(content=>{
			productIds.push(content['product']['productId'])
		})
	}
	captureList[sku] = productIds
}

const captureAfter = async ()=>{
	await CaptureCache.setCacheHasMap("selfNewList",0,"newList",JSON.stringify(captureList))
	console.log(`[Notice]: 一共添加了${Object.keys(captureList).length}条new货号信息`)
	process.exit()
}

;(async ()=>{

	await CaptureList({
		captureType:"self",
		captureBefore,
		setCaptureProducts,
		getCaptureList,	
		captureAfter,
	})

})()



