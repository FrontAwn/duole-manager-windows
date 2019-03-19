const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const readline = require('readline');
const cluster = require('cluster');
const config = require("../../config.js")
var cpuNum = require('os').cpus().length;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CaptureSold = require("../../libs/du/captureSold.js")
const CaptureCache = require("../../libs/du/cache.js")
const CaptureUtils = require("../../libs/du/utils.js")

const type = config["soldEnv"]["type"] || "sellSold"

const mode = config["soldEnv"]["mode"] || "current"

const conditions = config["soldEnv"]["conditions"] || {
	attrs:JSON.stringify(["product_id","sku","sold_num"]),
	where:JSON.stringify({
		type:2
	}),
}

const getProductListRequestConfig = config["soldEnv"]["getProductListRequestConfig"]

const getProducts = async ()=>{

	let res = await request(getProductListRequestConfig)

	let datas = res["data"]

	return datas
}

const cleanProducts = async ()=>{
	await CaptureCache.cleanCacheLinked(type,0,"needCaptureProducts")
}

const setNeedCaptureProducts = async ()=>{
	let length = await CaptureCache.getCacheLinkedLength(type,0,"needCaptureProducts")

	console.log(`[Notice]: 当前还有${length}个货号需要抓取`)

	if ( length === 0 ) {

		let products = await getProducts()
		for ( let [idx,product] of products.entries() ) {
			await CaptureCache.pushCacheLinked(type,0,"needCaptureProducts",JSON.stringify(product))
			console.log(`正在填充数据: ${idx+1}/${products.length}`)
		}
		console.log(`数据填充完毕: 一共${products.length}条需要抓取`)
	
	} 

}

// 从当前队列中获得一个要抓取的product信息
const getNeedCaptureProduct = async ()=>{
	let product = null
	// 查看意外退出的缓存队里中有没有要抓取的product
	let cacheCaptureProduct = await CaptureCache.popCacheLinked(type,0,"cacheCaptureProducts")
	if ( cacheCaptureProduct !== null ) {
		// 如果意外退出的缓存队列里存在product，优先抓取缓存
		product = JSON.parse(cacheCaptureProduct)
	} else {
		// 如果意外退出的缓存队列没有任何product，则取出新的product
		product = await CaptureCache.popCacheLinked(type,0,"needCaptureProducts")
		if ( product !== null ) {
			product = JSON.parse(product)
		} else {
			// 如果货号队列中没有数据，表示已经抓完所有货号，退出进程
			console.log(`[Notice] 已经没有货号可以抓取`)
			process.exit()
		}
	}

	return product
}

// 获得抓取的开始时间和结束时间
const getNeedCaptureProductDetail = async product=>{
	let { sku } = product

	let conditions = {
		attrs:JSON.stringify(["create_at","sold_last_id"]),
		order:JSON.stringify([ ["create_at","ASC"] ]),
		length:1,
	}

	let where = {
		sku
	}

	let details = {}

	switch (mode) {
		case "current":
			where["create_at"] = {
				"$ne":moment().format("YYYY-MM-DD")
			}
			where["sold_detail"] = ""
			details["startDate"] = moment().format("YYYY-MM-DD")
			break;
		case "history":
			where["sold_detail"] = {
				"$ne":""
			}
			details["stopDate"] = config["soldEnv"]["stopDate"]
			break;
		case "custom":
			if (!config["soldEnv"]["startDate"] || !config["soldEnv"]["stopDate"]) {
				console.log(`[Notice] custom模式下必须设置startDate和stopDate`);
				process.exit()
			}

			let startDate = config["soldEnv"]["startDate"]
			let stopDate = config["soldEnv"]["stopDate"]
			let createAt = moment(startDate).add(1,'day').format("YYYY-MM-DD")
			where["create_at"] = createAt
			details["startDate"] = startDate
			details["stopDate"] = stopDate
			break;
	}

	conditions["where"] = JSON.stringify(where)

	let res = await request({
		url:"/du/sell/getProductDetail",
		data:conditions
	})	

	if ( res["data"] === null || res["data"].length === 0 ){
		return null
	}

	let resData = res["data"][0]

	if ( resData["sold_last_id"] === "" ) {
		details["lastId"] = null 
	} else {
		details["lastId"] = resData["sold_last_id"]
	}


	if ( config["soldEnv"]["mode"] !== "custom" ) {
		if ( details["startDate"] ) {
			details["stopDate"] = resData["create_at"]
		} else {
			details["startDate"] = resData["create_at"]
		}
	}

	let buildedProduct = {...product,...details}

	return buildedProduct;
}



;(async ()=>{

	var sum = 0

	var product = null

	// await cleanProducts()
	// await CaptureCache.cleanCacheLinked(type,0,"cacheCaptureProducts")
	await setNeedCaptureProducts()
	async function nextCapture() {
			
			product = await getNeedCaptureProduct()
			// product = { product_id: '9675',sku: '818736-011'}

			product = await getNeedCaptureProductDetail(product)

			console.log(product)

			if ( product === null ) {
				console.log(`[Notice]: 当前货号没有最新销量纪录，请隔天再抓`)
				await nextCapture()
			}

			await CaptureSold({
				product,
				getProductSold:async (sold,lastId)=>{
					let state = await CaptureUtils.parseSoldHistory(
							product,
							sold,
							lastId,
						)
					return state
				},

				captureAfter:async ()=>{
					sum += 1
					console.log(`[Notice]: ${product["sku"]}抓取完成!!!`)
					let needCaptureProductsLength = await CaptureCache.getCacheLinkedLength(type,0,"needCaptureProducts")
					console.log(`[Notice]: 当前还要抓取${needCaptureProductsLength}个货号`)
					console.log(`[Notice]: 当前已经抓取完成${sum}个货号`)
					await common.awaitTime(300)
					await nextCapture()
					process.exit()
				}
			})
		}

		await nextCapture()

		process.on("SIGINT",async ()=>{
			if ( product !== null ) {
				await CaptureCache.pushCacheLinked(type,0,"cacheCaptureProducts",JSON.stringify(product))	
			}
			process.exit()
		})
})()















// ;(async ()=>{
// 	if ( cluster.isMaster ) {

// 		// 主进程
		
		// await cleanProducts()
		// await CaptureCache.cleanCacheLinked(type,0,"cacheCaptureProducts")
// 		for (let idx=1; idx <= cpuNum; idx++) {
// 			await common.awaitTime(500)
// 			let worker = cluster.fork()
// 			worker.on("message",onWorkerMessage)
// 		}

// 		process.on("SIGINT",onMasterSigint)


// 	} else {

// 		// 子进程

// 		async function nextCapture() {
			
// 			let product = await getNeedCaptureProduct()
// 			let product = { product_id: '9675',sku: '818736-011'}

// 			product = await getNeedCaptureProductDetail(product)

// 			console.log(product)

// 			if ( product === null ) {
// 				console.log(`[Notice]: 当前货号没有最新销量纪录，请隔天再抓`)
// 				await nextCapture()
// 			}

// 			process.send({
// 				event:"add",
// 				content:{
// 					product	
// 				}
// 			})

			

// 			await CaptureSold({
// 				product,
// 				getProductSold:async (sold,lastId)=>{
// 					// console.log(sold)
// 					let state = await CaptureUtils.parseSoldHistory(
// 							product,
// 							sold,
// 							lastId,
// 						)
// 					return state
// 				},

// 				captureAfter:async ()=>{
// 					process.send({
// 						event:"del",
// 						content:{
// 							product
// 						}
// 					})
// 					console.log(`[Notice]: ${product["sku"]}抓取完成!!!`)
// 					let needCaptureProductsLength = await CaptureCache.getCacheLinkedLength(type,0,"needCaptureProducts")
// 					console.log(`[Notice]: 当前还要抓取${needCaptureProductsLength}个货号`)
// 					// await nextCapture()
// 				}
// 			})
// 		}

// 		await nextCapture()

// 	}
	

// })()