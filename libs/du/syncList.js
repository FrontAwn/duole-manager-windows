const moment = require("moment")
const request = require("../../utils/request.js")
const common = require("../../utils/common.js")
const cache = require("../../utils/cache.js")

const localBase = "http://localhost:8101"
const remoteBase = "http://ms.tiangoutech.com:8888"

const syncDateKey = "/du/sync/listDate"

module.exports = async ()=>{

	let syncDate = await cache.getKey(syncDateKey)
	let currentDate = moment().format("YYYY-MM-DD")
	if ( syncDate === currentDate ) {
		console.log(`[Notice]: list已经同步,不能重复同步 ${syncDate}`)
		process.exit()
	}
	let newProduct = []
	let changeProduct = []

	let localList = await request({
		baseUrl:localBase,
		url:"/du/getSellProductList",
		data:{
			conditions:JSON.stringify({
				raw:true,
				where:{"id":{"$gt":0}}
			})
		}
	})

	let remoteList = await request({
		baseUrl:remoteBase,
		url:"/du/getSellProductList",
		data:{
			conditions:JSON.stringify({
				raw:true,
				where:{"id":{"$gt":0}}
			})
		}
	})

	localList = localList["data"]
	remoteList = common.indexBy(remoteList["data"],"product_id")

	for ( let [idx,product] of localList.entries() ) {
		let id = product["product_id"]
		let type = product["type"]
		if ( !remoteList[id+''] ) {
			newProduct.push(product)
		}
		if ( remoteList[id] && remoteList[id]["type"] !== type ) {
			changeProduct.push(product)
		}
	}
	
	newProduct = common.spliceArray(newProduct,10)

	for ( let [idx,product] of newProduct.entries() ) {
		await request({
			baseUrl:remoteBase,
			url:"/du/createSellProductList",
			data:{
				content:JSON.stringify(product)
			}
		})	
	}

	for ( let [idx,product] of changeProduct.entries() ) {
		let content = JSON.stringify({type:product["type"]})
		let where = JSON.stringify({product_id:product["product_id"]})
		await request({
			baseUrl:remoteBase,
			url:"/du/updateSellProductList",
			data:{ content, where }
		})
	}

	console.log(`[Notice]: 同步了${newProduct.length}个新货号`)
	console.log(`[Notice]: 同步了${changeProduct.length}有变化货号`)
	await cache.setKey(syncDateKey,moment().format("YYYY-MM-DD"))
	process.exit()
}













