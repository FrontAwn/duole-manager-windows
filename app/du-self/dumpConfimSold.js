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
var confimProductIdx = 800
const watchRuleListCallback = async (currStat,prevStat) => {
	let ruleListContent = await common.readFile(ruleListJson)
	let list = response.parseProductList(ruleListContent.toString())
	let currentProduct = getCurrentProduct()
	let currentProductId = currentProduct["product_id"]
	let detailOffset = null
	if ( list.length > 0 ) {
		list.forEach((product,idx)=>{
			if ( product["productId"] == currentProductId ) {
				detailOffset = idx + 1
			}
		})
	}
	if ( detailOffset !== null ) {
		await robot.clickDetail(detailOffset)
	} else {
		await cleanSku()
		confimProductIdx += 1
		await common.awaitTime(500)
		await searchSku()
	}
}

const watchRuleDetailCallback = async (currStat,prevStat) => {
	await robot.clickTotalSold()
}

const watchRuleSoldCallback = async (currStat,prevStat) => {
	let ruleSoldContent = await common.readFile(ruleSoldJson)
	let soldList = response.parseProductSold(ruleSoldContent.toString())
	console.log(soldList)
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

const getCurrentProduct = ()=>{
	return confimProducts[confimProductIdx]
}

const readyStart = async ()=>{
	await robot.clickWindowWhite()
	await searchSku()
}

const searchSku = async ()=>{
	let product = getCurrentProduct()
	let sku = product["sku"]
	sku = `${sku} `;
	await robot.clickSearchInput()
	await common.awaitTime(500)
	await robot.inputContent(sku)
	await common.awaitTime(500)
	await robot.clickEnter()
}

const cleanSku = async ()=>{
	await robot.clickSearchInput()
	await common.awaitTime(800)
	await robot.clickCleanButton()
}

;(async ()=>{
	fs.watchFile(ruleListJson,watchRuleListCallback)
	fs.watchFile(ruleDetailJson,watchRuleDetailCallback)
	fs.watchFile(ruleSoldJson,watchRuleSoldCallback)
	console.log(`[Notice]: 正在初始化监听文件函数.....`)
	await common.awaitTime(3000)
	console.log(`[Notice]: 监听文件完毕，开始初始化抓取信息.....`)
	await getConfimProducts()
	await readyStart()
})()

