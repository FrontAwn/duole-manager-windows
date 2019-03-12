const path = require("path")
const common = require("../../utils/common.js")
const database =require("../../utils/database.js")
const config = require("../../config.js")
const redis = database.getRedis()
const CaptureRobot = require("../../libs/du/captureRobot.js")
const CaptureCache = require("../../libs/du/cache.js")
var processId = new Date().getTime()
var type = config["soldConfig"]["type"] 

const ruleProcessJson = path.resolve(__dirname,"../../json/ruleProcess.json")

;(async ()=>{
		let ruleProcessContent = await common.readFile(ruleProcessJson)
		ruleProcessContent = JSON.parse(ruleProcessContent.toString())
		if ( ruleProcessContent["processId"] === null ) {
			ruleProcessContent["processId"] = processId
			await common.writeFile(ruleProcessJson,JSON.stringify(ruleProcessContent))
		} else {
			processId = ruleProcessContent["processId"]
		}
	
})()

var watchState = true

module.exports = {
	async beforeSendResponse(requestDetail, responseDetail) {

		// detail
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/detail") !== -1 ) {
			let newResponse = responseDetail.response



			if ( watchState ) {
				// 修改response结果
				let body = JSON.parse(newResponse.body.toString())

				CaptureRobot.handleDetail( newResponse.body.toString() )

				body['data']['detail']['title'] = ""
				body['data']['detail']['images'] = []
				body['data']['relationList'] = []
				body['data']['imageAndText'] = ""
				newResponse.body = JSON.stringify(body)	
			}


			return {response:newResponse}
		}



		// sold
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/lastSoldList") !== -1 ) {
			let soldBody = responseDetail.response.body.toString()

			if ( watchState ) {
				CaptureRobot.handleSold(soldBody)	
			}
			
			
		}




		// list
		if ( requestDetail.url.indexOf("https://m.poizon.com/search/list") !== -1 ) {
			let newResponse = responseDetail.response


			if ( watchState ) {
				// 修改response结果
				let body = JSON.parse(newResponse.body.toString())
				let currentCaptureProduct = await CaptureCache.getCacheHasMap(type,processId,"currentCaptureProduct")
				currentCaptureProduct = JSON.parse(currentCaptureProduct)
				let currentCaptureProductId = currentCaptureProduct["product_id"]


				let productList = []
				if ( currentCaptureProductId !== null && body["data"]["productList"].length !==0 ) {
					for ( let [idx,content] of body["data"]["productList"].entries() ) {
						if ( parseInt(content["productId"]) === parseInt(currentCaptureProductId) ) {
							productList.push(content)
						}
					}
				}
				body["data"]["productList"] = productList
				newResponse.body = JSON.stringify(body)

				CaptureRobot.handleList(newResponse.body,requestDetail.url)
			}


			return {response:newResponse}
		}
		console.log("----------------------------->[SHOW URL]",requestDetail.url)
	}
}