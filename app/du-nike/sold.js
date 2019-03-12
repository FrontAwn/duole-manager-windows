const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const readline = require('readline');
const soldConfig = require("../../config.js")["soldConfig"]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CaptureCache = require("../../libs/du/cache.js")
const CaptureRobot = require("../../libs/du/captureRobot.js")
const ruleProcessJson = path.resolve(__dirname,"../../json/ruleProcess.json")

var processId = 0
var type = soldConfig["type"]

const getProducts = async ()=>{
	let conditions = {
		where:JSON.stringify({
			type:2,
			sku:{
				"$ne":""
			}
		}),
		attrs:JSON.stringify(["product_id","sku"])
	}
	let res = await request({
		url:"/du/nike/getProductList",
		data:conditions
	})

	return res["data"];
}



;(async ()=>{
	
	// await CaptureCache.cleanCacheLinked(type,processId,"needCaptureProducts")

	let cacheProductLength = await CaptureCache.getCacheLinkedLength(type,processId,"needCaptureProducts")

	console.log(`[Notice] 当前还有${cacheProductLength}需要抓取`)

	if ( cacheProductLength === 0 ) {

		rl.question('当前没有可以抓取的数据，是否填充？', async (answer) => {
			if ( answer === "y" | answer === "Y" ) {
				let products = await getProducts()
				for ( let [idx,product] of products.entries() ) {
					await CaptureCache.pushCacheLinked(type,processId,"needCaptureProducts",JSON.stringify(product))
					console.log(`正在填充数据: ${idx+1}/${products.length}`)
				}
				console.log(`数据填充完毕: 一共${products.length}条需要抓取`)
			} 
			process.exit()
		})

	} else {
		await CaptureRobot.start()
	}

})()