const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const captureSoldDetailRobot = require("../../libs/du/captureSoldDetailRobot.js")

const ruleListJson = path.resolve(__dirname,"../../json/ruleList.json")
const ruleDetailJson = path.resolve(__dirname,"../../json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"../../json/ruleSold.json")

captureSoldDetailRobot({
	getProducts:async ()=>{
		let conditions = {
			where:JSON.stringify({type:2}),
		}
		let res = await request({
			url:"/du/self/getProductList",
			data:conditions
		})

		let products = res["data"]

		return products
	},

	getAlreadyCaptureProducts:async ()=>{
		let res = await request({
			url:"/du/self/getAlreadyCaptureProductIds"
		})
		return res["data"]
	},

	handleList:async (ruleList,currentProduct)=>{
	},

	handleDetail:async (ruleDetail,currentProduct)=>{
	},

	handleSold:async (ruleSold,currentProduct)=>{
	},

	watchListPath:ruleListJson,
	watchDetailPath:ruleDetailJson,
	watchSoldPath:ruleSoldJson
})

