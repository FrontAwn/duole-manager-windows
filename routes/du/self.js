const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const DuappResource = database.getDuappResource()
const NikeProductList = model.getNikeProductList()
const SelfProductList = model.getSelfProductList()
const SelfProductDetailTotal = model.getSelfProductDetailTotal()
const routerGet = {}

const skipSkuJson = path.resolve(__dirname,"../../app/du-self/json/skipSkus.json")
const newSkuJson = path.resolve(__dirname,"../../app/du-self/json/newSkus.json")

routerGet.getProductList = async ctx=>{
	let query = ctx.query
	let where = query['where'] ? JSON.parse(query['where']) : {
		id:{
			"$gt":0
		}
	}
	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
	let order = query["order"] ? JSON.parse(query["order"]) : []
	let res = await SelfProductList.findAll({
		where,
		attributes:attrs,
		order,
		raw:true
	})
	ctx.body = res
}

routerGet.getProductDetail = async ctx=>{
	let query = ctx.query
	let where = query['where'] ? JSON.parse(query['where']) : {
		id:{
			"$gt":0
		}
	}
	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
	let order = query["order"] ? JSON.parse(query["order"]) : []
	let res = await SelfProductDetailTotal.findAll({
		where,
		attributes:attrs,
		order,
		raw:true
	})
	ctx.body = res
}

routerGet.putConfimSkuDetail = async ctx=>{
	let detail = JSON.parse(ctx.query.detail)
	let res = await SelfProductDetailTotal.findOne({
		raw:true,
		where:{
			"product_id":detail["product_id"],
			"create_at":detail["create_at"]
		}
	})
	await DuappResource.transaction(async t=>{
		if ( res === null ) {
			await SelfProductDetailTotal.create(detail,{transaction:t})
			console.log(`创建数据记录:product_id为${detail["product_id"]}`)
		} else {
			await SelfProductDetailTotal.update(detail,{
				where:{
					"product_id":detail["product_id"]
				},
				transaction:t
			})
			console.log(`更新数据记录:product_id为${detail["product_id"]}`)
		}
	})
}

routerGet.setSkipStateFromNewSkus = async ctx=>{
	let skus = JSON.parse(ctx.query.skus)
	let res = { type:4 }
	for ( let [idx,sku] of skus.entries() ) {
		await DuappResource.transaction(async t=>{
			SelfProductList.update(res,{
				where:{
					sku,
				},
				transaction:t
			})
		})
	}
	await common.writeFile(skipSkuJson,JSON.stringify({}))
	await common.writeFile(newSkuJson,JSON.stringify({}))
}

exports.get = routerGet





