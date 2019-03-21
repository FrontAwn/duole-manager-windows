const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const common = require("../../utils/common.js")

module.exports = async options=>{

	let setCaptureProduct = options.setCaptureProduct || null

	let getCaptureDetail = options.getCaptureDetail || null

	let captureAfter = options.captureAfter || null

	if ( setCaptureProduct === null || typeof setCaptureProduct !== "function" ) {
		console.log(`[Error]: 请传入setCaptureProduct函数，并返回包括要抓取的数据集`)
		process.exit()
	}

	if ( getCaptureDetail === null || typeof getCaptureDetail !== "function" ) {
		console.log(`[Error]: 请传入getCaptureDetail函数，并接受抓取后的detail数据作为参数`)
		process.exit()
	}

	let product = await setCaptureProduct()
	let url = product["url"]
	let productId = product["product_id"]
	let res = await common.httpGet(url)
	let detail = response.parseProductDetail(res)
	await getCaptureDetail(detail)

	if ( captureAfter !== null && typeof captureAfter === "function" ) {
		await captureAfter()
	}

}