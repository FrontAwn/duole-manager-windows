const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const readline = require('readline');

const cluster = require('cluster');
const cpuNum = require('os').cpus().length;

const CaptureDetail = require("../../libs/du/captureDetail.js")
const CaptureCache = require("../../libs/du/cache.js")



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
		url:"/du/self/getProductList",
		data:conditions
	})

	return res["data"]
}


const getNeedCaptureProducts = async ()=>{

	// await CaptureCache.delCacheHasMap("selfDetail",0,"needCaptureProducts")

	let needCaptureProducts = await CaptureCache.getCacheHasMap("selfDetail",0,"needCaptureProducts")

    if ( needCaptureProducts === null ) {
    	needCaptureProducts = {}
    } else {
    	needCaptureProducts = JSON.parse(needCaptureProducts)
    }

    if ( Object.keys(needCaptureProducts).length === 0 ) {
    	let products = await getProducts()
		let chunkLenth = Math.ceil(products.length / cpuNum)
		let chunks = common.spliceArray(products,chunkLenth)
		for ( let [idx,products] of chunks.entries() ) {
			let processId = new Date().getTime()
			needCaptureProducts[processId] = chunks[idx]
			await common.awaitTime(300)
		}
		await CaptureCache.setCacheHasMap("selfDetail",0,"needCaptureProducts",JSON.stringify(needCaptureProducts))
    } 

    return needCaptureProducts;

}


const captureBefore = async ()=>{
	let conditions = {
		where:JSON.stringify({
			type:0
		})
	}
	let res = await request({
		url:"/du/self/getProductList",
		data:conditions
	})

	let datas = res["data"]
	let length = datas.length

	if ( length > 0 ) {
		console.log(`[Notice]: 当前存在个${length}新货号需要处理`)	
		process.exit()
	}
}


;(async ()=>{

	

	if (cluster.isMaster) {

		await captureBefore()

		let needCaptureProducts = await getNeedCaptureProducts()

		for ( let [processId,products] of Object.entries(needCaptureProducts) ) {
			let worker = cluster.fork()
			worker.send({processId,needCaptureProducts})
		}

		cluster.on('message', async (worker,processId,handle)=>{
			await common.awaitTime(1000)
			delete needCaptureProducts[processId]
			await CaptureCache.setCacheHasMap("selfDetail",0,"needCaptureProducts",JSON.stringify(needCaptureProducts))
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
						url:"/du/self/putConfimSkuDetail",
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












