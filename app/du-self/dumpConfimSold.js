const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const robot = require("../../utils/robot.js")

const ruleListJson = path.resolve(__dirname,"./json/ruleList.json")
const ruleDetailJson = path.resolve(__dirname,"./json/ruleDetail.json")
const ruleSoldJson = path.resolve(__dirname,"./json/ruleSold.json")

var confimProducts = null
var confimProductIds = 0

const watchRuleListCallback = async (currStat,prevStat) => {
	console.log("list")
}

const watchRuleDetailCallback = async (currStat,prevStat) => {
	console.log("detail")
}

const watchRuleSoldCallback = async (currStat,prevStat) => {
	console.log("sold")
}

const getConfimProducts = async ()=>{
	let where = {type:2}
	let res = await request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where)
		}
	})
	let datas = res["data"]
	if ( confimProducts === null ) {
		confimProducts = common.deepCopy(datas)
	}
}

;(async ()=>{
	// fs.watchFile(ruleListJson,watchRuleListCallback)
	// fs.watchFile(ruleDetailJson,watchRuleDetailCallback)
	// fs.watchFile(ruleSoldJson,watchRuleSoldCallback)
	// console.log(`[Notice]: 正在初始化监听文件函数.....`)
	// await common.awaitTime(3000)
	// console.log(`[Notice]: 监听文件完毕，开始初始化抓取信息.....`)
	await getConfimProducts()
})()

