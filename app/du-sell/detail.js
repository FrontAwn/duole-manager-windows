const fs = require("fs")
const path = require("path")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureCache = require("../../libs/du/cache.js")
const CaptureDetail = require("../../libs/du/captureDetail.js")

const cluster = require('cluster');
const cpuNum = require('os').cpus().length;

const getProducts = async ()=>{
	let conditions = {
		where:JSON.stringify({
			type:2,
			url:{
				"$ne":""
			}
		})
	}
	let res = await request({
		url:"/du/sell/getProductList",
		data:conditions
	})

	return res["data"]
}


const getNeedCaptureProducts = async ()=>{

	await CaptureCache.delCacheHasMap("nikeDetail",0,"needCaptureProducts")

	let needCaptureProducts = await CaptureCache.getCacheHasMap("nikeDetail",0,"needCaptureProducts")

    if ( needCaptureProducts === null ) {
    	needCaptureProducts = {}
    } else {
    	needCaptureProducts = JSON.parse(needCaptureProducts)
    }

    if ( Object.keys(needCaptureProducts).length === 0 ) {
    	let products = await getProducts()
    	console.log(`[Notice]: 一共需要抓取${products.length}个货号`)
		let chunkLenth = Math.ceil(products.length / cpuNum)
		let chunks = common.spliceArray(products,chunkLenth)
		for ( let [idx,products] of chunks.entries() ) {
			let processId = new Date().getTime()
			needCaptureProducts[processId] = chunks[idx]
			await common.awaitTime(300)
		}
		await CaptureCache.setCacheHasMap("nikeDetail",0,"needCaptureProducts",JSON.stringify(needCaptureProducts))
    } 
   	console.log(`[Notice]: 一共分为${Object.keys(needCaptureProducts)}个进程同时抓取`)
   	await common.awaitTime(2000)
    return needCaptureProducts;

}


;(async ()=>{

	

	if (cluster.isMaster) {

		let needCaptureProducts = await getNeedCaptureProducts()

		for ( let [processId,products] of Object.entries(needCaptureProducts) ) {
			let worker = cluster.fork()
			worker.send({processId,needCaptureProducts})
		}

		cluster.on('message', async (worker,processId,handle)=>{
			await common.awaitTime(1000)
			delete needCaptureProducts[processId]
			await CaptureCache.setCacheHasMap("nikeDetail",0,"needCaptureProducts",JSON.stringify(needCaptureProducts))
			console.log(`[Notice]: ${processId}进程消除`)
		})

	} else {

		async function start(datas){
			let needCaptureProducts = common.deepCopy(datas["needCaptureProducts"])
			let processId = datas.processId
			let products = needCaptureProducts[processId]

			await CaptureDetail({
				setCaptureProducts:async ()=>products,
				getCaptureDetail:async (detail,idx)=>{
					await request({
						url:"/du/sell/updateProductDetail",
						data:{
							detail:JSON.stringify(detail),
						}
					})
				},
				captureAfter:async ()=>{
					process.send(processId)
				}
			})
		}

		process.on("message",start)
	}

})()













