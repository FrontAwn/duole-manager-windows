const path = require("path")
const moment = require("moment")
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

	getAlreadyCapture:"/du/self/getAlreadyCaptureBySold",
	setAlreadyCapture:"/du/self/setAlreadyCaptureBySold",
	cleanAlreadyCapture:"/du/self/cleanAlreadyCaptureBySold",
	watchListPath:ruleListJson,
	watchDetailPath:ruleDetailJson,
	watchSoldPath:ruleSoldJson
})

