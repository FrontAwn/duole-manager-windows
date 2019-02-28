const path = require("path")
const moment = require("moment")
const readline = require("readline")
const Request = require("../../utils/request.js")
const Response = require("../../utils/response.js")
const Common = require("../../utils/common.js")

const skipSkuJson = path.resolve(__dirname,"./json/skipSkus.json")

const getNeedSkipSkus = async ()=>{
	let skipSkuJsonContent = await Common.readFile(skipSkuJson)
	skipSkuJsonContent = JSON.parse(skipSkuJsonContent.toString())
	if ( Object.keys(skipSkuJsonContent).length > 0 ) {
		let skipSkus = Object.keys(skipSkuJsonContent)
		return skipSkus
	} else {
		console.log(`[Notice]: 没有找到要设置skip的货号`)
		process.exit()
	}
}

const setSikpSkus = async skus=>{
	await Request({
		url:"/du/self/setSkipStateFromNewSkus",
		data:{
			skus:JSON.stringify(skus)
		}
	})
	console.log(`[Notice]: 一共设置skip货号${skus.length}个`)
}

;(async ()=>{
	let skipSkus = await getNeedSkipSkus()
	await setSikpSkus(skipSkus)
})()