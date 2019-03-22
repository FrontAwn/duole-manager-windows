const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const cache = require("../../utils/cache.js")

const localBase = "http://localhost:8101"
const remoteBase = "http://ms.tiangoutech.com:8888"

const syncDateKey = "/du/sync/detailDate"


const getRemoteDateNum = async ()=>{
	let res = await request({
		baseUrl:remoteBase,
		url:'/du/getSellProductDetail',
		data:{
			conditions:JSON.stringify({
				raw:true,
				attributes:["date_num"],
				order:[["date_num","DESC"]],
				limit:1,
			})
		}
	})
	console.log(`[Notice]: 获得远程数据时间${res["data"][0]["date_num"]}`)
	return res["data"][0]["date_num"]
}

const getLocalDateNum = async ()=>{
	let res = await request({
		baseUrl:localBase,
		url:'/du/getSellProductDetail',
		data:{
			conditions:JSON.stringify({
				raw:true,
				attributes:["date_num"],
				order:[["date_num","DESC"]],
				limit:1,
			})
		}
	})
	console.log(`[Notice]: 获得本地数据时间${res["data"][0]["date_num"]}`)
	return res["data"][0]["date_num"]

}

const getNeedSyncProducts = async (remoteDateNum)=>{
	let res = await request({
		baseUrl:localBase,
		url:"/du/getSellProductDetail",
		data:{
			conditions:JSON.stringify({
				raw:true,
				where:{
					"date_num":{
						"$gt":remoteDateNum
					}
				}
			})
		}
	})

	let products = res["data"]
	console.log(`[Notice]: 获得本地需要同步的数据${products.length}条`)
	return products
}

const getLocalSyncProducts = async (localDateNum)=>{
	let res = await request({
		baseUrl:localBase,
		url:"/du/getSellProductDetail",
		data:{
			conditions:JSON.stringify({
				raw:true,
				where:{
					"date_num":localDateNum
				}
			})
		}
	})

	let products = res["data"]
	console.log(`[Notice]: 获得本地需要同步的数据${products.length}条`)
	return products
}

const getRemoteSyncProducts = async (remoteDateNum)=>{
	let res = await request({
		baseUrl:remoteBase,
		url:"/du/getSellProductDetail",
		data:{
			conditions:JSON.stringify({
				raw:true,
				where:{
					"date_num":remoteDateNum
				}
			})
		}
	})

	let products = res["data"]
	console.log(`[Notice]: 获得远程已经同步的数据${products.length}条`)
	return products
}


module.exports = async ()=>{

	let localDateNum = await getLocalDateNum()
	let remoteDateNum = await getRemoteDateNum()

	let syncDatas = []

	if ( localDateNum === remoteDateNum ) {
		let localSyncProducts = await getLocalSyncProducts(localDateNum)
		let remoteSyncProducts = await getRemoteSyncProducts(remoteDateNum)
		if ( localSyncProducts.length === remoteSyncProducts.length ) {
			console.log("[Notice]: 当前没有需要同步的数据")
			process.exit()
		}

		remoteSyncProducts = common.indexBy(remoteSyncProducts,"product_id")

		for ( let [idx,product] of localSyncProducts.entries() ) {
			let productId = product["product_id"]
			if ( !remoteSyncProducts[productId] ) {
				syncDatas.push(product)
			}
		}
	} else if ( localDateNum > remoteDateNum ) {
		syncDatas = await getNeedSyncProducts(remoteDateNum)		
	}

	console.log(`[Notice]: 当前一共有${syncDatas.length}条需要同步`)

	if ( syncDatas.length > 0 ) {
		let chunkLength = 5
		let alreadySync = 0
		chunks = common.spliceArray(syncDatas,chunkLength)
		for ( let [idx,chunk] of chunks.entries() ) {
			await request({
				baseUrl:remoteBase,
				url:"/du/createSellProductDetail",
				data:{
					content:JSON.stringify(chunk)
				}
			})
			alreadySync += chunk.length
			console.log(`${alreadySync}/${syncDatas.length}`)
		}
	} else {
		console.log("[Notice]: 当前没有需要同步的数据")
	}

	process.exit()

}