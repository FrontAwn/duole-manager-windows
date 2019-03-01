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
const alreadyDumpSoldIdsJson = path.resolve(__dirname,"./json/alreadyDumpSoldIds.json")

var confimProducts = null
var confimProductIdx = 0
var alreadyDumpIds = []
var skipIds = []

const watchRuleListCallback = async (currStat,prevStat) => {
	let ruleListContent = await common.readFile(ruleListJson)
	let list = response.parseProductList(ruleListContent.toString())
	let currentProduct = duapp.getSearchProduct(confimProducts,confimProductIdx)
	let currentProductId = currentProduct["product_id"]
	let detailOffset = null
	if ( list.length > 0 ) {
		list.forEach((product,idx)=>{
			if ( product["productId"] == currentProductId ) {
				detailOffset = idx + 1
			}
		})
	}
	console.log(detailOffset)
	if ( detailOffset !== null ) {
		await robot.clickDetail(detailOffset)
	} else {
		alreadyDumpIds.push(currentProduct['product_id'])
		common.writeFile(alreadyDumpSoldIdsJson,JSON.stringify(alreadyDumpIds))
		await duapp.cleanSku()
		confimProductIdx += 1
		await common.awaitTime(500)
		await duapp.searchSku(duapp.getSearchProduct(confimProducts,confimProductIdx)["sku"])
	}
}

const watchRuleDetailCallback = async (currStat,prevStat) => {
	let ruleDetailContent = await common.readFile(ruleDetailJson)
	let detail = response.parseProductDetail(ruleDetailContent.toString())
	let currentProduct = duapp.getSearchProduct(confimProducts,confimProductIdx)
	if ( detail['sold_total'] < 5 ) {
		await robot.clickBack();
		await common.awaitTime(2000)
		await duapp.cleanSku()
		alreadyDumpIds.push(currentProduct['product_id'])
		common.writeFile(alreadyDumpSoldIdsJson,JSON.stringify(alreadyDumpIds))
		confimProductIdx += 1
		await common.awaitTime(500)
		await duapp.searchSku(duapp.getSearchProduct(confimProducts,confimProductIdx)["sku"])
	} else {
		await robot.clickTotalSold()
	}
}

const watchRuleSoldCallback = async (currStat,prevStat) => {
	let ruleSoldContent = await common.readFile(ruleSoldJson)
	let soldList = response.parseProductSold(ruleSoldContent.toString())
	let currentProduct = duapp.getSearchProduct(confimProducts,confimProductIdx)
	let state = await duapp.saveSoldDate(currentProduct['product_id'],soldList)
	if ( !state ) {
		await duapp.rollSold()
	} else {
		await robot.clickBack();
		await common.awaitTime(2000)
		await robot.clickBack();
		await common.awaitTime(2000)
		await duapp.cleanSku()
		alreadyDumpIds.push(currentProduct['product_id'])
		common.writeFile(alreadyDumpSoldIdsJson,JSON.stringify(alreadyDumpIds))
		confimProductIdx += 1
		await common.awaitTime(500)
		await duapp.searchSku(duapp.getSearchProduct(confimProducts,confimProductIdx)["sku"])

	}
}

const getConfimProducts = async ()=>{
	let where = {type:2}
	let attrs = ["product_id","sku"]
	let res = await request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where),
			attrs:JSON.stringify(attrs),
		}
	})
	let datas = res["data"]
	let products = []
	let fileContent = await common.readFile(alreadyDumpSoldIdsJson)
	alreadyDumpIds = JSON.parse(fileContent.toString())
	if (alreadyDumpIds.length === datas.length) {
		alreadyDumpIds = []
	}
	alreadyDumpIds = [...alreadyDumpIds,...skipIds]
	if ( alreadyDumpIds.length > 0 ) {
		for ( let [idx,content] of datas.entries() ) {
			if ( !alreadyDumpIds.includes(content["product_id"]) ) {
				products.push(content)
			}
		}
	} else {
		products = common.deepCopy(datas)
	}
	confimProducts = products
}

;(async ()=>{
	fs.watchFile(ruleListJson,watchRuleListCallback)
	fs.watchFile(ruleDetailJson,watchRuleDetailCallback)
	fs.watchFile(ruleSoldJson,watchRuleSoldCallback)
	await getConfimProducts()
	console.log(`[Notice]: 正在初始化监听文件函数.....`)
	console.log(`[Notice]: 一共需要抓取${confimProducts.length}个货号`)
	await common.awaitTime(3000)
	console.log(`[Notice]: 监听文件完毕，开始初始化抓取信息.....`)
	await duapp.readyStart()
	await duapp.searchSku(duapp.getSearchProduct(confimProducts,confimProductIdx)["sku"])
})()

