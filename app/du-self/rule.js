const path = require("path")
const common = require("../../utils/common.js")
const database =require("../../utils/database.js")
const ruleDetailJson = path.resolve(__dirname,"../../json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"../../json/ruleSold.json")
const ruleListJson = path.resolve(__dirname,"../../json/ruleList.json")

const redis = database.getRedis()
const CaptureRobot = require("../../libs/du/captureRobot.js")
const CaptureUtils = require("../../libs/du/utils.js")

module.exports = {
	async beforeSendResponse(requestDetail, responseDetail) {

		// detail
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/detail") !== -1 ) {
			let newResponse = responseDetail.response

			// 修改response结果
			let body = JSON.parse(newResponse.body.toString())

			common.writeFile(ruleDetailJson,newResponse.body.toString())
			CaptureRobot.handleDetail( newResponse.body.toString() )

			body['data']['detail']['title'] = ""
			body['data']['detail']['images'] = []
			body['data']['relationList'] = []
			body['data']['imageAndText'] = ""
			newResponse.body = JSON.stringify(body)


			return {response:newResponse}
		}



		// sold
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/lastSoldList") !== -1 ) {
			let soldBody = responseDetail.response.body.toString()
			
			common.writeFile(ruleSoldJson,soldBody)
			CaptureRobot.handleSold(soldBody)
		}




		// list
		if ( requestDetail.url.indexOf("https://m.poizon.com/search/list") !== -1 ) {
			let newResponse = responseDetail.response


			// 修改response结果
			let body = JSON.parse(newResponse.body.toString())
			let currentCaptureProduct = await CaptureUtils.getCurrentCaptureProduct()
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



			common.writeFile(ruleListJson,newResponse.body)
			CaptureRobot.handleList(newResponse.body)
			return {response:newResponse}
		}
		console.log("----------------------------->[SHOW URL]",requestDetail.url)
	}
}