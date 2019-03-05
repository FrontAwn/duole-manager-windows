const robot = require("./robot.js")
const common = require("./common.js")
const moment = require("moment")
const env = require("../env.js")
const request = require("./request.js")
const response = require("./response.js")
const fs = require("fs")
const database = require("./database.js")
const redis = database.getRedis()

var soldTotal = {}

var needDumpProducts = []

var currentDumpIdx = 0

const getSearchProduct = ()=>{
	if ( needDumpProducts[currentDumpIdx] ) {
		return needDumpProducts[currentDumpIdx]
	} else {
		return null
	}
}

const readyStart = async ()=>{
	await robot.clickWindowWhite()
}

const searchSku = async ()=>{
	let currentProduct = getSearchProduct()
	if ( currentProduct === null ) {
		consooe.log("-------------->[Notice]: 已经抓取完所有货号，没有对应货号信息了")
		process.exit()
		return
	}
	let sku = currentProduct["sku"]
	let productId = currentProduct["productId"]
	console.log(`[Notice]: 当前货号为 ${sku}`)
	console.log(`[Notice]: 当前product_id为 ${productId}`)
	await redis.set("duapp_current_dump_product_id",productId)
	await robot.clickSearchInput()
	await common.awaitTime(500)
	await robot.inputContent(sku)
	await common.awaitTime(500)
	await robot.clickEnter()
}

const cleanSku = async ()=>{
	await robot.clickSearchInput()
	await common.awaitTime(300)
	await robot.clickCleanButton()
}

 

const rollSold = async ()=>{
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
}

const saveSoldDate = async (productId,dateStrings=[],dateScope=null)=>{
	let currentDate = moment().format("YYYY-MM-DD")
	if ( dateScope === null && env["soldDateScope"] ) {
		dateScope = env["soldDateScope"]
	}
	if ( dateScope === null ) { 
		dateScope = 1
	}
	if ( typeof dateScope === "string" && dateScope.includes("-") ) {
		dateScope = moment(currentDate).diff(dateScope,'day')
	}
	if ( dateStrings.length === 0 ) return true

	if ( dateStrings.length > 0 ) {
		for ( let [idx,content] of dateStrings.entries() ) {
			let dateString = content["time"]
			let size = parseFloat(content["size"])
			let date = common.parseDateString(dateString)
			let {diff,format} = date
			if ( diff === 0 ) continue
			if ( diff<=dateScope ) {
				if ( !soldTotal[format] ) soldTotal[format] = {}
				if ( !soldTotal[format][size] ) {
					soldTotal[format][size] = 1
				} else {
					soldTotal[format][size] += 1
				}
			} else {
				let res = JSON.stringify(soldTotal)
				await request({
					method:"post",
					url:"/du/self/setProductSoldDetail",
					data:{
						productId,
						soldDetail:res,
					}
				})
				return true
			}
		}
	}

	return false

}


const getNeedDumpProducts = async (totalProducts,alreadyProducts)=>{
	let res = []
	let total = common.deepCopy(totalProducts)
	let already = [] 

	if ( alreadyProducts !== null || Array.isArray(alreadyProducts) && alreadyProducts.length !== 0) {
		already = common.deepCopy(alreadyProducts)
	}

	for ( let [idx,detail] of total.entries() ) {
		if ( !already.includes(detail["product_id"]) ) {
			res.push({
				productId:detail["product_id"],
				sku:detail["sku"]
			})
		}
	}

	return res;
}

const setAlreadyDumpProductId = async ()=>{
	let currentProduct = getSearchProduct()
	await request({
		url:"/du/self/setAlreadyDumpProductId",
		data:{
			productId:currentProduct["productId"]
		}
	})
}


exports.robot = async (options)=>{

	let getProducts = options.getProducts || null
	let getAlreadyDumpProducts = options.getAlreadyDumpProducts || null

	let handleList = options.handleList || null
	let handleDetail = options.handleDetail || null
	let handleSold = options.handleSold || null

	let watchListPath = options.watchListPath || null
	let watchDetailPath = options.watchDetailPath || null
	let watchSoldPath = options.watchSoldPath || null

	if ( getProducts === null ) {
		console.log(`[Error]: getProducts属性必须返回要抓取的products`)
		process.exit()
	}

	if (
		watchListPath === null ||
		watchDetailPath === null ||
		watchSoldPath === null
	) { console.log(`[Error]: 参数必须含有监听请求变化的数据文件路径[watchListPath,watchDetailPath,watchSoldPath]`) 
		process.exit()
	}


	let watchListCallback = async ()=>{
		let currentProduct = getSearchProduct()
		let ruleListContent = await common.readFile(watchListPath)
		let ruleList = response.parseProductList(ruleListContent.toString())
		if ( handleList !== null ) await handleList(ruleList,currentProduct)
		if ( ruleList.length > 0 ) {
			await robot.clickDetail(1)
		} else {
			await setAlreadyDumpProductId()
			currentDumpIdx += 1
			await cleanSku()
			await common.awaitTime(500)
			await searchSku()
		}
	}

	let watchDetailCallback = async ()=>{
		let currentProduct = getSearchProduct()
		let ruleDetailContent = await common.readFile(watchDetailPath)
		let ruleDetail = response.parseProductDetail(ruleDetailContent.toString())
		if ( handleDetail !== null ) await handleDetail(ruleDetail,currentProduct)
			if ( ruleDetail["sold_total"] <= 5 ) {
				await robot.clickBack();
				await common.awaitTime(2000)
				await cleanSku()
				await setAlreadyDumpProductId()
				currentDumpIdx += 1
				await common.awaitTime(500)
				await searchSku()
			} else {
				await robot.clickTotalSold()
			}
	}

	let watchSoldCallback = async ()=>{
		let currentProduct = getSearchProduct()
		let ruleSoldContent = await common.readFile(watchSoldPath)
		let ruleSold = response.parseProductSold(ruleSoldContent.toString())
		if ( handleSold !== null ) await handleSold(ruleSold,currentProduct)
		let state = await saveSoldDate(currentProduct["productId"],ruleSold)
		if ( !state ) {
			await rollSold()
		} else {
			await robot.clickBack();
			await common.awaitTime(2000)
			await robot.clickBack();
			await common.awaitTime(2000)
			await cleanSku()
			await setAlreadyDumpProductId()
			currentDumpIdx += 1
			await common.awaitTime(500)
			await searchSku()
		}
	}

	fs.watchFile(watchListPath,watchListCallback)
	fs.watchFile(watchDetailPath,watchDetailCallback)
	fs.watchFile(watchSoldPath,watchSoldCallback)
	let products = await getProducts()
	let alreadyDumpProducts = null
	if ( getAlreadyDumpProducts !== null ) {
		alreadyDumpProducts = await getAlreadyDumpProducts()
	}
	needDumpProducts = await getNeedDumpProducts(products,alreadyDumpProducts)
	console.log(`[Notice]: 正在初始化监听文件函数.....`)
	console.log(`[Notice]: 一共需要抓取${products.length}个货号`)

	await common.awaitTime(3000)
	await readyStart()
	await searchSku()
}
