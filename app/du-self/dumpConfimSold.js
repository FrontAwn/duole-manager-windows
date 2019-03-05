const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const robot = require("../../utils/robot.js")
const duapp = require("../../utils/duapp.js") 

const ruleListJson = path.resolve(__dirname,"./json/ruleList.json")
const ruleDetailJson = path.resolve(__dirname,"./json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"./json/ruleSold.json")

duapp.robot({
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

	getAlreadyDumpProducts:async ()=>{
		let res = await request({
			url:"/du/self/getAlreadyDumpProductIds"
		})
		return res["data"]
	},
	handleList:async ()=>{

	},
	handleDetail:async ()=>{

	},
	handleSold:async (ruleSold,currentProduct)=>{
	},

	watchListPath:ruleListJson,
	watchDetailPath:ruleDetailJson,
	watchSoldPath:ruleSoldJson
})

