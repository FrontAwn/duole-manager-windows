const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureUtils = require("../../libs/du/utils.js")
const CaptureList = require("../../libs/du/captureList.js")

const alreadyCaptureProductIds = []

const hasProductIds = []
const diffProductIds = []
const totalProductIds = []

const printCaptureProcess = ()=>{
	console.log(`----------> 当前已经抓取${totalProductIds.length}个货号`)
	console.log(`----------> has: ${hasProductIds.length}`)
	console.log(`----------> new: ${diffProductIds.length}`)
}

const getAlreadyCaptureProductIds = async ()=>{
	let conditions = {
		where:JSON.stringify({type:2}),
		attrs:JSON.stringify(["product_id"])
	}
	let res = await request({
		url:"/du/nike/getProductList",
		data:conditions
	})
	for (let [idx,content] of res["data"].entries()) {
		alreadyCaptureProductIds.push(content["product_id"])
	}
}

const getCaptureList = async list=>{
	for ( let [idx,content] of list.entries() ) {
		let product = content["product"]
		let productId = product["productId"].toString()
		let title = product["title"]
		totalProductIds.push(productId)
		if ( alreadyCaptureProductIds.includes(productId) ) {
			hasProductIds.push(productId)
			let idx = alreadyCaptureProductIds.indexOf(productId)
			alreadyCaptureProductIds.splice(idx,1)
		} else {
			if ( hasProductIds.includes(productId) ) continue;
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
			diffProductIds.push(productId)
		}
	}
	printCaptureProcess()
}

const captureAfter = async ()=>{
	console.log(`[Notice]: 一共有${alreadyCaptureProductIds.length}货号下架`)
	for ( let [idx,productId] of alreadyCaptureProductIds.entries() ) {
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
	await getAlreadyCaptureProductIds()
	await CaptureList({
		captureType:"nike",
		getCaptureList,	
		captureAfter,
	})

})()

