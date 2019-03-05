const path = require("path")
const common = require("../../utils/common.js")
const database =require("../../utils/database.js")
const redis = database.getRedis()
const ruleDetailJson = path.resolve(__dirname,"./json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"./json/ruleSold.json")
const ruleListJson = path.resolve(__dirname,"./json/ruleList.json")

module.exports = {
	async beforeSendResponse(requestDetail, responseDetail) {
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/detail") !== -1 ) {
			let newResponse = responseDetail.response
			let body = JSON.parse(newResponse.body.toString())
			common.writeFile(ruleDetailJson,newResponse.body.toString())
			body['data']['detail']['title'] = ""
			body['data']['detail']['images'] = []
			body['data']['relationList'] = []
			body['data']['imageAndText'] = ""
			newResponse.body = JSON.stringify(body)
			return {response:newResponse}
		}
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/lastSoldList") !== -1 ) {
			let soldBody = responseDetail.response.body.toString()
			common.writeFile(ruleSoldJson,soldBody)
		}

		if ( requestDetail.url.indexOf("https://m.poizon.com/search/list") !== -1 ) {
			let newResponse = responseDetail.response
			let body = JSON.parse(newResponse.body.toString())
			common.writeFile(ruleListJson,newResponse.body.toString())
			let currentDumpProductId = await redis.get("duapp_current_dump_product_id")
			let productList = []
			if ( currentDumpProductId !== null && body["data"]["productList"].length !==0 ) {
				for ( let [idx,content] of body["data"]["productList"].entries() ) {
					if ( parseInt(content["productId"]) === parseInt(currentDumpProductId) ) {
						productList.push(content)
					}
				}
			}
			body["data"]["productList"] = productList
			newResponse.body = JSON.stringify(body)
			return {response:newResponse}
		}
		console.log("----------------------------->[SHOW URL]",requestDetail.url)
	}
}