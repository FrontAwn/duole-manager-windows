const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const response = require("../../utils/response.js")
const DuappResource = database.getDuappResource()
const NikeProductList = model.getNikeProductList()
const SelfProductList = model.getSelfProductList()
const SelfProductDetailTotal = model.getSelfProductDetailTotal()
const routerGet = {}

const newSkuJson = path.resolve(__dirname,"../../app/du-self/json/newSkus.json")
const skipSkuJson = path.resolve(__dirname,"../../app/du-self/json/skipSkus.json")

var newSkuRequest = null

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
	if ( newSkuRequest === null ) {
		newSkuRequest = await common.readFile(newSkuJson)
		newSkuRequest = JSON.parse(newSkuRequest.toString())	
	}
	let productIds = []
	if ( Object.keys(newSkuRequest).length > 0 ) {
		for (let [sku,ids] of Object.entries(newSkuRequest)) {
			productIds = [...productIds,...ids]
		}	
	}
	ctx.body = productIds
}


routerGet.putSelfNewProductUrl = async ctx=>{
	let url = ctx.query.url
	if ( newSkuRequest === null ) {
		newSkuRequest = await common.readFile(newSkuJson)
		newSkuRequest = JSON.parse(newSkuRequest.toString())	
	}
	let newSkus = Object.keys(newSkuRequest)
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
				delete newSkuRequest[sku]
			})
			await common.writeFile(skipSkuJson,JSON.stringify(newSkuRequest))
		}
	}
}









exports.get = routerGet