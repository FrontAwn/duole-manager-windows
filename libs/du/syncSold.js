const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const cache = require("../../utils/cache.js")
const soldEnv = require("../../config.js")["soldEnv"]

const localBase = "http://localhost:8101"
const remoteBase = "http://ms.tiangoutech.com:8888"

const syncDateKey = "/du/sync/soldDate"
const startDate = soldEnv["startDate"]
const stopDate = soldEnv["stopDate"]
const startDateNum = parseInt(moment(startDate).format("YYYYMMDD"))
const stopDateNum = parseInt(moment(stopDate).format("YYYYMMDD"))


const getLocalSyncDatas = async ()=>{
	let res = await request({
		baseUrl:localBase,
		url:"/du/getSellProductDetail",
		data:{
			conditions:JSON.stringify({
				raw:true,
				attributes:["product_id","sku","price","size_list","sold_total","sold_num","sold_detail","sold_last_id","date_num"],
				where:{
					"date_num":{
						"$between":[stopDateNum,startDateNum]
					},
				}
			})
		}
	})
	console.log(`[Notice]: 本地当前日期存在${res["data"].length}条`)
	return res["data"]
}

const getRemoteSyncDatas = async ()=>{

	let res = await request({
		baseUrl:remoteBase,
		url:"/du/getSellProductDetail",
		data:{
			conditions:JSON.stringify({
				raw:true,
				attributes:["product_id","sold_num","date_num"],
				where:{
					"date_num":{
						"$between":[stopDateNum,startDateNum]
					},
				},
			})
		}
	})

	console.log(`[Notice]: 远程当前日期存在${res["data"].length}条`)
	return res["data"]


}

;(async ()=>{

	console.log(`[Notice]: 当前同步起始日期${startDate}`)
	console.log(`[Notice]: 当前结束起始日期${stopDate}`)

	let localSyncDatas = await getLocalSyncDatas()
	let remoteSyncDatas = await getRemoteSyncDatas()

	var remoteHasSoldProducts = {}
	var remoteZeroSoldProducts = {}
	let updateProducts = []
	let createProducts = []

	if ( remoteSyncDatas.length === 0 ) {
		createProducts = common.deepCopy(localSyncDatas)		
	} else {
		
		for ( let [idx,product] of remoteSyncDatas.entries() ) {
			let productId = product["product_id"]
			let soldNum = product["sold_num"]
			let dateNum = product["date_num"]
			if ( parseInt(product["sold_num"]) === 0 ) {
				if ( !remoteZeroSoldProducts[productId] ) remoteZeroSoldProducts[productId] = []
				if ( !remoteZeroSoldProducts[productId].includes(dateNum) ) remoteZeroSoldProducts[productId].push(dateNum)
			} else {
				if ( !remoteHasSoldProducts[productId] ) remoteHasSoldProducts[productId] = []
				if ( !remoteHasSoldProducts[productId].includes(dateNum) ) remoteHasSoldProducts[productId].push(dateNum)
			}
		}


		for ( let [idx,product] of localSyncDatas.entries() ) { 
			let productId = product["product_id"]
			let soldNum = product["sold_num"]
			let dateNum = product["date_num"]
			if ( !remoteHasSoldProducts[productId] && !remoteZeroSoldProducts[productId] ) {
				createProducts.push(product)
			} else {

				if ( remoteZeroSoldProducts[productId] ) {
					if ( parseInt(soldNum) > 0 ) {

						if ( !remoteZeroSoldProducts[productId].includes(dateNum)  ) {
							createProducts.push(product)
						} else {
							updateProducts.push(product)
						}

					} else {
						if ( !remoteZeroSoldProducts[productId].includes(dateNum) ) {
							createProducts.push(product)
						}
					}
				} 

			}

		}

		console.log(`[Notice]: 需要创建${createProducts.length}条新数据`)
		console.log(`[Notice]: 需要同步${updateProducts.length}条销量数据`)
	}




	let createNum = 0
	let updateNum = 0

	if ( updateProducts.length > 0 ) {
		for ( let [idx,product] of updateProducts.entries() ) {
			let where = JSON.stringify({
				"product_id":product["product_id"],
				"date_num":product["date_num"]
			})

			let content = JSON.stringify({
				"sold_num":product["sold_num"],
				"sold_detail":product["sold_detail"],
				"sold_last_id":product["sold_last_id"]
			})
			await request({
				baseUrl:remoteBase,
				url:"/du/updateSellProductDetail",
				data:{ where, content }
			})
			updateNum += 1
			console.log(`[Notice]: 正在同步${product["product_id"]}销量数据 ${updateNum}/${updateProducts.length}`)
		}	
	}


	if ( createProducts.length > 0 ) {
		let createChunks = common.spliceArray(createProducts,5)

		for ( let [idx,chunk] of createChunks.entries() ) {
			await request({
				baseUrl:remoteBase,
				url:"/du/createSellProductDetail",
				data:{
					content:JSON.stringify(chunk)
				}
			})
			createNum += chunk.length
			console.log(`[Notice]: 正在创建新货号信息 ${createNum}/${createProducts.length}`)
		}
	}


	let newProductIds = []
	for ( let idx in createProducts ) {
		let product = createProducts[idx]
		newProductIds.push(product["product_id"])
	}
	console.log(`------> 创建完毕的所有新数据ProductId:`)
	console.log(newProductIds)
	
	process.exit()
})()







