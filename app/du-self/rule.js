const path = require("path")
const common = require("../../utils/common.js")
const ruleDetailJson = path.resolve(__dirname,"./json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"./json/ruleSold.json")
const ruleListJson = path.resolve(__dirname,"./json/ruleList.json")


module.exports = {
	async beforeSendResponse(requestDetail, responseDetail) {
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/detail") !== -1 ) {
			let newResponse = responseDetail.response
			let body = JSON.parse(newResponse.body.toString())
			await common.writeFile(ruleDetailJson,newResponse.body.toString())
			body['data']['detail']['title'] = ""
			body['data']['detail']['images'] = []
			body['data']['relationList'] = []
			body['data']['imageAndText'] = ""
			newResponse.body = JSON.stringify(body)
			return {response:newResponse}
		}
		if ( requestDetail.url.indexOf("https://m.poizon.com/product/lastSoldList") !== -1 ) {
			let soldBody = responseDetail.response.body.toString()
			await common.writeFile(ruleSoldJson,soldBody)
		}

		if ( requestDetail.url.indexOf("https://m.poizon.com/search/list") !== -1 ) {
			let listBody = responseDetail.response.body.toString()
			await common.writeFile(ruleListJson,listBody)

		}
		console.log("----------------------------->[SHOW URL]",requestDetail.url)
	}
}