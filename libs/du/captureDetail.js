const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const common = require("../../utils/common.js")
const utils = require("./utils.js")

module.exports = async options=>{

	let captureBefore = options.captureBefore || null

	let setCaptureProducts = options.setCaptureProducts || null

	let getCaptureDetail = options.getCaptureDetail || null

	if ( captureBefore !== null && typeof captureBefore === "function" ) {
		await captureBefore()
	}

	if ( setCaptureProducts === null || typeof setCaptureProducts !== "function" ) {
		console.log(`[Error]: 请传入setCaptureProducts函数，并返回包括要抓取的数据集`)
		process.exit()
	}

	if ( getCaptureDetail === null || typeof getCaptureDetail !== "function" ) {
		console.log(`[Error]: 请传入getCaptureDetail函数，并接受抓取后的detail数据作为参数`)
	}

	let needCaptureProducts = await setCaptureProducts()

	if ( needCaptureProducts.length !== 0 ) {
		console.log(`[Notice]: 当前需要抓取${needCaptureProducts.length}个货号`)
		let currentCaptureIdx = 0 
		for ( let [idx,content] of needCaptureProducts.entries() ) {
			let url = content["url"]
			let productId = content["product_id"]
			let res = await common.httpGet(url)
			let detail = response.parseProductDetail(res)
			await getCaptureDetail(detail)
			currentCaptureIdx += 1
			await utils.setAlreadyCaptureProductId("detail",productId)
			console.log(`----------> 已经完成[ ${currentCaptureIdx}/${needCaptureProducts.length} ] `)
			await common.awaitTime(300)
		}
		console.log("[Notice]: 当天数据已经抓取完成一轮，正在消除缓存")
		await utils.cleanAlreadyCaptureProductId("detail")
		console.log("[Notice]: 缓存已经清除完成，可以重新抓取")
		process.exit()
	} 

}