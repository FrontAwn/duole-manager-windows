const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const CaptureUtils = require("../../libs/du/utils.js")

const getNeedSkipSkus = async ()=>{
	let skuList = await CaptureUtils.getNewList()
	if ( Object.keys(skuList).length > 0 ) {
		let skipSkus = Object.keys(skuList)
		return skipSkus
	} else {
		console.log(`[Notice]: 没有找到要设置skip的货号`)
		process.exit()
	}
}

const setSikpSkus = async skus=>{
	await request({
		url:"/du/self/setSkipStateFromNewSkus",
		data:{
			skus:JSON.stringify(skus)
		}
	})
	await CaptureUtils.cleanNewList()
	console.log(`[Notice]: 一共设置skip货号${skus.length}个`)
	process.exit()
}

;(async ()=>{
	let skipSkus = await getNeedSkipSkus()
	await setSikpSkus(skipSkus)
})()