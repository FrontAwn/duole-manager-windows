const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")

const CaptureUtils = require("../../libs/du/utils.js")
const CaptureRobot = require("../../libs/du/captureRobot.js")


const getNeedCaptureProducts = async ()=>{
	let conditions = {
		where:JSON.stringify({type:2}),
	}
	let res = await request({
		url:"/du/self/getProductList",
		data:conditions
	})

	let products = res["data"]

	return products
}

const getRestProducts = (needCaptureProducts,alreadyCaptureProducts)=>{
	let res = []
	if ( alreadyCaptureProducts === null || Array.isArray(alreadyCaptureProducts) && alreadyCaptureProducts.length === 0 ) {
		res = common.deepCopy(needCaptureProducts)
	} else {
		for ( let [idx,product] of needCaptureProducts.entries() ) {
			if ( !alreadyCaptureProducts.includes(product["product_id"]) ) {
				res.push(product)
			}
		}
	}
	return res;
}

;(async ()=>{
	let needCaptureProducts = await getNeedCaptureProducts()
	let alreadyCaptureProducts = await CaptureUtils.getAlreadyCaptureProductId("sold")
	let restProducts = getRestProducts(needCaptureProducts,alreadyCaptureProducts)
	if ( restProducts.length !== 0 ) {
		console.log(`[Notice]: 一共需要抓取${restProducts.length}个货号`)
		console.log(`[Notice]: 两秒钟后启动抓取函数...`)
		await common.awaitTime(2000)
		await CaptureRobot.start(restProducts)
	} else {

	}
})()


