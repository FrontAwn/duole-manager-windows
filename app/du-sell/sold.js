const path = require("path")
const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const cluster = require('cluster');
const config = require("../../config.js")
var cpuNum = require('os').cpus().length;


const CaptureSold = require("../../libs/du/captureSold.js")
const CaptureCache = require("../../libs/du/cache.js")
const CaptureUtils = require("../../libs/du/utils.js")



const type = config["soldEnv"]["type"] || "sellSold"
var startDate = config["soldEnv"]["startDate"] || moment().subtract(1,'day').format("YYYY-MM-DD")
var stopDate = config["soldEnv"]["stopDate"] || moment().subtract(1,'day').format("YYYY-MM-DD")
const getProductListRequestConfig = config["soldEnv"]["getProductListRequestConfig"]



const getProductList = async ()=>{
	let res = await request(getProductListRequestConfig)
	let datas = res["data"]
	return datas
}



const setNeedCaptureProducts = async ()=>{
	let length = await CaptureCache.getCacheLinkedLength(type,0,"needCaptureProducts")

	console.log(`[Notice]: 当前还有${length}个货号需要抓取`)

	if ( length === 0 ) {
		let products = await getProductList()
		for ( let [idx,product] of products.entries() ) {
			await CaptureCache.pushCacheLinked(type,0,"needCaptureProducts",JSON.stringify(product))
			console.log(`正在填充数据: ${idx+1}/${products.length}`)
		}
		console.log(`数据填充完毕: 一共${products.length}条需要抓取`)
	} 

}

// 从当前队列中获得一个要抓取的product信息
const getNeedCaptureProduct = async ()=>{
	// // 查看意外退出的缓存队里中有没有要抓取的product
	// let cacheCaptureProduct = await CaptureCache.popCacheLinked(type,0,"cacheCaptureProducts")
	// if ( cacheCaptureProduct !== null && cacheCaptureProduct !== "null" ) {
	// 	// 如果意外退出的缓存队列里存在product，优先抓取缓存
	// 	product = JSON.parse(cacheCaptureProduct)
	// } else {
	// 	// 如果意外退出的缓存队列没有任何product，则取出新的product
	// }
	let product = await CaptureCache.popCacheLinked(type,0,"needCaptureProducts")
	if ( product !== null ) {
		product = JSON.parse(product)
	} else {
		console.log(`[Notice] 已经没有货号可以抓取`)
		process.exit()
	}
	return product
}

// 获得抓取的开始时间,结束时间,LastId
const getNeedCaptureProductDetail = async product=>{
	let { sku } = product
	let lastId = null

	let currentDate = moment().format("YYYY-MM-DD")
	if ( typeof startDate === "number" ) {
		startDate = moment(currentDate).subtract(startDate,'day').format("YYYY-MM-DD")
	}
	if ( typeof stopDate === "number" ) {
		stopDate = moment(startDate).subtract(stopDate-1,'day').format("YYYY-MM-DD")
	}

	let createAt = moment(startDate).add(1,"day").format("YYYY-MM-DD")

	let conditions = {
		attrs:JSON.stringify(["sold_last_id"]),
		where:JSON.stringify({
			sku,
			"create_at":createAt
		}),
		length:1,
	}

	let productDetailResponse = await request({
		url:"/du/sell/getProductDetail",
		data:conditions
	})

	if ( productDetailResponse["data"].length === 0 ) {
		return null
	}

	if ( productDetailResponse["data"][0]["sold_last_id"] !== '') {
		lastId = productDetailResponse["data"][0]["sold_last_id"]
	}

	let buildedProduct = {...product,...{lastId,startDate,stopDate}}

	return buildedProduct;
}



;(async ()=>{

	var sum = 0

	var product = null

	var clean = false

	// 清理缓存和队列
	if ( clean ) {
		await CaptureCache.cleanCacheLinked(type,0,"needCaptureProducts")
		await CaptureCache.cleanCacheLinked(type,0,"cacheCaptureProducts")
	}
	
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
					// console.log(sold)
					let state = await CaptureUtils.parseSoldHistory(
							product,
							sold,
							lastId,
						)
					return state
				},

				captureAfter:async ()=>{
					sum += 1
					let needCaptureProductsLength = await CaptureCache.getCacheLinkedLength(type,0,"needCaptureProducts")

					console.log()
					console.log("-----------")
					console.log(`${product["sku"]}抓取完成`)
					console.log(`当前还要抓取${needCaptureProductsLength}个货号`)
					console.log(`当前已经抓取完成${sum}个货号`)
					console.log("-----------")
					console.log()

					await nextCapture()
				}
			})
		}

		await nextCapture()

		// process.on("SIGINT",async ()=>{
		// 	if ( product !== null ) {
		// 		await CaptureCache.pushCacheLinked(type,0,"cacheCaptureProducts",JSON.stringify(product))	
		// 	}
		// 	process.exit()
		// })
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