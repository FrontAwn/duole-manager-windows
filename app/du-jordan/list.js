const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureList = require("../../libs/du/captureList.js")

const currentAlreadyHasProducts = {}

const allCaptureIds = []

const needToConfimIds = []
const notChangeIds = []
const newIds = []


const printCaptureProcess = ()=>{
	console.log(`----------> 当前已经抓取${allCaptureIds.length}个货号`)
	console.log(`----------> 重新上架的货号: ${needToConfimIds.length}`)
	console.log(`----------> 没有变化的货号: ${notChangeIds.length}`)
	console.log(`----------> 新货号: ${newIds.length}`)
}

const getCurrentAlreadyHasProducts = async ()=>{
	let conditions = {
		attrs:JSON.stringify(["product_id","type"]),
	}

	let res = await request({
		url:"/du/sell/getProductList",
		data:conditions
	})

	if (res["data"].length > 0) {
		for ( let [idx,content] of res["data"].entries() ) {
			currentAlreadyHasProducts[content["product_id"]] = content["type"]
		}	
	}
	
}

const getCaptureList = async list=>{
	for ( let [idx,content] of list.entries() ) {
		let product = content["product"]
		let productId = product["productId"].toString()
		let title = product["title"]
		let soldNum = product["soldNum"]
		allCaptureIds.push(productId)
		if ( currentAlreadyHasProducts[productId] ) {
			let type = currentAlreadyHasProducts[productId]
			switch (type) {
				case 2:
					notChangeIds.push(productId)
					break;
				case 4:
					needToConfimIds.push(productId)
					break;
			}
			let conditions = {
				where:JSON.stringify({
					"product_id":productId,
				}),
				content:JSON.stringify({
					"sold_num":soldNum,
					"type":2
				})
			}
			await request({
				url:"/du/sell/updateProductList",
				data:conditions
			})

			delete currentAlreadyHasProducts[productId]
		} else {
			if ( notChangeIds.includes(productId) || 
				 needToConfimIds.includes(productId) ||
				 newIds.includes(productId)
			) continue;
			let res = {
				"product_id":productId,
				title,
				"type":0,
				"sold_num":soldNum,
				"create_at":moment().format("YYYY-MM-DD")
			}
			await request({
				url:"/du/sell/insertProductList",
				data:{
					res:JSON.stringify(res)
				}
			})
			newIds.push(productId)
		}
	}
	printCaptureProcess()
}

const captureAfter = async ()=>{
	let restAlreadyHasProducts = common.deepCopy(currentAlreadyHasProducts)
	let skipIds = []
	for ( let [productId,type] of Object.entries(restAlreadyHasProducts) ) {
		if ( type === 2 ) {
			let conditions = {
				where:JSON.stringify({
					product_id:productId,
				}),
				content:JSON.stringify({type:4})
			}
			await request({
				url:"/du/sell/updateProductList",
				data:conditions
			})
			skipIds.push(productId)
		}
	}
	console.log(`[Notice]: 一共有${skipIds.length}货号下架`)
	process.exit()
}

;(async ()=>{
	await getCurrentAlreadyHasProducts()
	await CaptureList({
		captureType:"jordan",
		getCaptureList,	
		captureAfter,
	})
})()

