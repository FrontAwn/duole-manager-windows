const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const common = require("../../utils/common.js")

module.exports = async options=>{

	let setCaptureProducts = options.setCaptureProducts || null

	let getCaptureDetail = options.getCaptureDetail || null

	let captureAfter = options.captureAfter || null

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
			await getCaptureDetail(detail,idx)
			currentCaptureIdx += 1
			console.log(`----------> 已经完成[ ${currentCaptureIdx}/${needCaptureProducts.length} ] `)
			await common.awaitTime(500)
			// break;
		}
	}

	console.log(`[Notice]: 已经抓取该进程所有要处理的货号，一共${needCaptureProducts.length}条`)
	
	if ( captureAfter !== null && typeof captureAfter === "function" ) {
		await captureAfter()
	}
	process.exit()

}