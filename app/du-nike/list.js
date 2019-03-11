const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureUtils = require("../../libs/du/utils.js")
const CaptureList = require("../../libs/du/captureList.js")

const alreadyCaptureProducts = {}

const needToConfimIds = []
const notChangeIds = []
const diffIds = []
const allCaptureIds = []

var currentCaptureIds = []

const printCaptureProcess = ()=>{
	console.log(`----------> 当前已经抓取${allCaptureIds.length}个货号`)
	console.log(`----------> needConfim: ${needToConfimIds.length}`)
	console.log(`----------> notChange: ${notChangeIds.length}`)
	console.log(`----------> newChange: ${diffIds.length}`)
	console.log(`----------> captureIds: ${currentCaptureIds}`)
}

const getAlreadyCaptureProducts = async ()=>{
	let conditions = {
		attrs:JSON.stringify(["product_id","type"])
	}
	let res = await request({
		url:"/du/nike/getProductList",
		data:conditions
	})

	for ( let [idx,content] of res["data"].entries() ) {
		alreadyCaptureProducts[content["product_id"]] = content["type"]
	}
}

const getCaptureList = async list=>{
	currentCaptureIds = []
	for ( let [idx,content] of list.entries() ) {
		let product = content["product"]
		let productId = product["productId"].toString()
		let title = product["title"]
		allCaptureIds.push(productId)
		currentCaptureIds.push(productId)
		if ( alreadyCaptureProducts[productId] ) {

			let type = alreadyCaptureProducts[productId]

			switch (type) {
				case 2:
					notChangeIds.push(productId)
					break;
				case 4:
					needToConfimIds.push(productId)
					break;
			}
			delete alreadyCaptureProducts[productId]
		} else {
			if ( notChangeIds.includes(productId) || needToConfimIds.includes(productId) ) continue;
			let res = {
				"product_id":productId,
				title,
				"type":0,
				"create_at":moment().format("YYYY-MM-DD")
			}
			await request({
				url:"/du/nike/addProductList",
				data:{
					res:JSON.stringify(res)
				}
			})
			diffIds.push(productId)
		}
	}
	printCaptureProcess()
}

const captureAfter = async ()=>{
	let needToSkipIds = Object.keys(alreadyCaptureProducts)
	console.log(`[Notice]: 一共有${needToConfimIds.length}货号重新上架`)
	console.log(`[Notice]: 一共有${needToSkipIds.length}货号下架`)
	for ( let [idx,productId] of needToConfimIds.entries() ) {
		let conditions = {
			where:JSON.stringify({product_id:productId}),
			content:JSON.stringify({type:2})
		}
		await request({
			url:"/du/nike/updateProductList",
			data:conditions
		})
	}
	for ( let [idx,productId] of needToSkipIds.entries() ) {
		let conditions = {
			where:JSON.stringify({product_id:productId}),
			content:JSON.stringify({type:4})
		}
		await request({
			url:"/du/nike/updateProductList",
			data:conditions
		})
	}
	process.exit()
}

;(async ()=>{
	await getAlreadyCaptureProducts()
	await CaptureList({
		captureType:"nike",
		getCaptureList,	
		captureAfter,
	})
})()

