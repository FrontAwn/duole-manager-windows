const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const common = require("../../utils/common.js")

var rootParams = {}

// 检查要抓去的product是否有url这个属性
const checkProductHasUrlAttr = products=>{
	for ( let [idx,content] of products.entries() ) {
		if ( !content["url"] ) {
			console.log(`[Notice]: product数据集中存在含有不包括url属性的数据`)
			process.exit()
			break
		}
	}
}

const getAlreadyCaptureProducts = async url=>{
	let res = await request({url})
	return res["data"]
}

const setAlreadyCaptureProduct = async (url,productId)=>{
	await request({
		url,
		data:{
			productId,
		}
	})
}

const cleanAlreadyCaptureProducts = async url=>{
	await request({url})
}

const getNeedCaptureProducts = (allProducts,alreadyProductIds)=>{
	let res = []
	for ( let [idx,content] of allProducts.entries() ) {
		if ( !alreadyProductIds.includes(content["product_id"]) ) {
			res.push(content)
		}
	}
	return res
}


module.exports = async options=>{

	let captureBefore = options.captureBefore || null

	let getProducts = options.getProducts || null

	let setDetail = options.setDetail || null

	let getAlreadyCapture = options.getAlreadyCapture || null

	let setAlreadyCapture = options.setAlreadyCapture || null

	let cleanAlreadyCapture = options.cleanAlreadyCapture || null

	if ( captureBefore !== null && typeof captureBefore === "function" ) {
		await captureBefore()
	}


	if ( getProducts === null || typeof getProducts !== "function" ) {
		console.log(`[Error]: 请传入getProducts函数，并返回包括detail url的数据集`)
		process.exit()
	}

	if ( setDetail === null || typeof setDetail !== "function" ) {
		console.log(`[Error]: 请传入setDetail函数，并接受抓取后的detail数据作为参数`)
	}


	if ( setAlreadyCapture === null ) {
		console.log(`[Error]: setAlreadyCapture属性必须设置代表添加已抓取product缓存的请求接口`)
		process.exit()
	}

	if ( cleanAlreadyCapture === null ) {
		console.log(`[Error]: cleanAlreadyCapture属性必须设置代表清除所有缓存的已抓取product请求接口`)
		process.exit()
	}

	rootParams = {
		captureBefore,
		getProducts,
		setDetail,
		getAlreadyCapture,
		setAlreadyCapture,
		cleanAlreadyCapture,
	}

	let alreadyCaptureProducts = []
	let needCaptureProducts = []
	let products = await getProducts()
	checkProductHasUrlAttr(products)
	if ( getAlreadyCapture !== null ) {
		alreadyCaptureProducts = await getAlreadyCaptureProducts(getAlreadyCapture)
	}
	needCaptureProducts = await getNeedCaptureProducts(products,alreadyCaptureProducts)


	if ( needCaptureProducts.length !== 0 ) {
		console.log(`[Notice]: 当前需要抓取${needCaptureProducts.length}个货号`)
		let currentCaptureIdx = 0 
		for ( let [idx,content] of needCaptureProducts.entries() ) {
			let url = content["url"]
			let productId = content["product_id"]
			let res = await common.httpGet(url)
			let detail = response.parseProductDetail(res)
			await setDetail(detail)
			currentCaptureIdx += 1
			await setAlreadyCaptureProduct(setAlreadyCapture,productId)

			console.log(`----------> 已经完成[ ${currentCaptureIdx}/${needCaptureProducts.length} ] `)
			await common.awaitTime(300)
		}
	} else {
		console.log("[Notice]: 当天数据已经抓取完成一轮，正在消除缓存重新抓取")
		await cleanAlreadyCaptureProducts(cleanAlreadyCapture)
		console.log("[Notice]: 缓存已经清除完成，可以重新抓取")
		process.exit()
	}

}