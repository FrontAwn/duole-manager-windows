const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const response = require("../../utils/response.js")

const DuappResource = database.getMysql("DuappResource");
const SellProductList = model.getModel("DuappResource","SellProductList");
const SellProductDetailTotal = model.getModel("DuappResource","SellProductDetailTotal")

const routerGet = {}
const CaptureCache = require("../../libs/du/cache.js")

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