const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const response = require("../../utils/response.js")

const DuappResource = database.getMysql("DuappResource");
const SelfProductList = model.getModel("DuappResource","SelfProductList");
const SelfProductDetailTotal = model.getModel("DuappResource","SelfProductDetailTotal")

const SellProductList = model.getModel("DuappResource","SellProductList");
const SellProductDetailTotal = model.getModel("DuappResource","SellProductDetailTotal")



const routerGet = {}
const CaptureCache = require("../../libs/du/cache.js")

routerGet.getSelfConfimProductIds = async ctx=>{
	let res = await SelfProductList.findAll({
		raw:true,
		attributes:["product_id"],
		where:{
			type:2,
			url:""
		}
	})
	let productIds = []
	res.forEach(content=>{
		productIds.push(content['product_id'])
	})
	ctx.body = productIds
}

routerGet.putSelfConfimProductUrl = async ctx=>{
	let url = ctx.query.url
	let urlObject = common.urlParse(url)
	let query = common.qsParse(urlObject['query'])
	let productId = query['productId']
	let res = {
		"url":url,
		"type":2
	}
	await DuappResource.transaction(async t=>{
		await SelfProductList.update(res,{
			where:{
				"product_id":productId
			},
			transaction:t
		})
	})
}


routerGet.getSelfNewProductIds = async ctx=>{
	let newList = await CaptureCache.getCacheHasMap("selfNewList",0,"newList");
	newList = JSON.parse(newList)
	let productIds = []
	if ( Object.keys(newList).length > 0 ) {
		for (let [sku,ids] of Object.entries(newList)) {
			productIds = [...productIds,...ids]
		}	
	}
	ctx.body = productIds
}


routerGet.putSelfNewProductUrl = async ctx=>{
	let url = ctx.query.url

	let newList = await CaptureCache.getCacheHasMap("selfNewList",0,"newList");
	newList = JSON.parse(newList)
	let newSkus = Object.keys(newList)
	let detailResponse = await common.httpGet(url)
	let detail = response.parseProductDetail(detailResponse)
	if ( detail !== null ) {
		let sku = detail["sku"]
		let productId = detail["product_id"]
		let title = detail["title"]
		if ( newSkus.includes(sku) ) {
			let res = {
				"product_id":productId,
				"type":2,
				"url":url,
				"title":title
			}
			await DuappResource.transaction(async t=>{
				await SelfProductList.update(res,{
					where:{
						"sku":sku,
						"type":0
					},
					transaction:t
				})
				delete newList[sku]
			})
			await CaptureCache.setCacheHasMap("selfNewList",0,"newList",JSON.stringify(newList))
		}
	}
}


routerGet.getSellNewProductIds = async ctx=>{
	let productIds = []
	let res = await SellProductList.findAll({
		raw:true,
		attributes:["product_id"],
		where:{
			type:0,
			url:""
		}
	})
	res.forEach(content=>{
		productIds.push(content['product_id'])
	})
	ctx.body = productIds
}

routerGet.putSellNewProductUrl = async ctx=>{
	let url = ctx.query.url
	let detailResponse = await common.httpGet(url)
	let detail = response.parseProductDetail(detailResponse)
	let urlObject = common.urlParse(url)
	let sku = detail["sku"]
	let productId = detail["product_id"]
	let res = {
		sku,
		url,
		"type":2
	}
	await DuappResource.transaction(async t=>{
		await SellProductList.update(res,{
			where:{
				"product_id":productId,
			},
			transaction:t
		})
	})
}





exports.get = routerGet