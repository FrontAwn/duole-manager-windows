const path = require("path")
const moment = require("moment")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const routerGet = {}
const routerPost = {}
const redis = database.getRedis()
const DuappResource = database.getMysql("DuappResource");
const SellProductList = model.getModel("DuappResource","SellProductList");
const SellProductDetailTotal = model.getModel("DuappResource","SellProductDetailTotal")


routerGet.getProductList = async ctx=>{
	let query = ctx.query
	let where = query['where'] ? JSON.parse(query['where']) : {
		id:{
			"$gt":0
		}
	}
	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
	let order = query["order"] ? JSON.parse(query["order"]) : []
	let group = query["group"] || ""

	let conditions = {
		where,
		attributes:attrs,
		order,
		group,
		raw:true
	}

	if ( query["page"] || query["length"] ) {
		let page = query["page"] || 1
		let length = query["length"] || 10000
		let limit = parseInt(length)
		let offset = (parseInt(page)-1) * length
		conditions["offset"] = offset
		conditions["limit"] = limit
	}

	let res = await SellProductList.findAll(conditions)
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
	let group = query["group"] || ""

	let conditions = {
		where,
		attributes:attrs,
		order,
		group,
		raw:true
	}

	if ( query["page"] || query["length"] ) {
		let page = query["page"] || 1
		let length = query["length"] || 10000
		let limit = parseInt(length)
		let offset = (parseInt(page)-1) * length
		conditions["offset"] = offset
		conditions["limit"] = limit
	}

	let res = await SellProductDetailTotal.findAll(conditions)
	ctx.body = res
}



routerGet.insertProductList = async ctx=>{
	let res = JSON.parse(ctx.query.res)	
	await DuappResource.transaction(async t=>{
		await SellProductList.create(res,{transaction:t});
	})
}



routerGet.updateProductList = async ctx=>{
	let query = ctx.query
	if ( !query["where"] || !query["content"] ) {
		console.log(`[Error]: /du/nike/updateProductList接口中缺少where或者content参数`)
		process.exit()
	}
	let where = JSON.parse(query["where"])
	let content = JSON.parse(query["content"])
	await DuappResource.transaction(async t=>{
		await SellProductList.update(content,{
			where,
			transaction:t
		});
	})
}



routerGet.updateProductDetail = async ctx=>{
	let detail = JSON.parse(ctx.query.detail)
	let res = await SellProductDetailTotal.findOne({
		raw:true,
		where:{
			"product_id":detail["product_id"],
			"sku":detail["sku"],
			"create_at":detail["create_at"],
		}
	})
	await DuappResource.transaction(async t=>{
		if ( res === null ) {
			await SellProductDetailTotal.create(detail,{transaction:t})
			console.log(`创建数据记录:product_id为${detail["product_id"]}`)
		} else {
			await SellProductDetailTotal.update(detail,{
				where:{
					"product_id":detail["product_id"],
				},
				transaction:t
			})
			console.log(`更新数据记录:product_id为${detail["product_id"]}`)
		}
	})
}


routerGet.updateProductSoldDetail = async ctx=>{
	let query = ctx.query
	let sold = JSON.parse(query["sold"])
	let product = JSON.parse(query["product"])
	let createAt = query["createAt"]
	let lastId = query["lastId"]
	let soldNum = 0

	let productId = product["product_id"]
	let sku = product["sku"]

	console.log()
	console.log("---------------")
	console.log("货号:",sku)
	console.log("日期:",createAt)
	console.log("lastId:",lastId)
	console.log("销量:",sold)
	console.log("---------------")
	console.log()


	let currentProduct = await SellProductDetailTotal.findOne({
		raw:true,
		attributes:["id"],
		where:{
			sku,
			"create_at":createAt,
		}
	})

	for ( let [size,num] of Object.entries(sold) ) {
		soldNum += num
	}

	let saveData = {
		"sku":sku,
		"product_id":productId,
		"sold_detail":JSON.stringify(sold),
		"sold_num":soldNum,
		"sold_last_id":lastId,
		"create_at":createAt,
		"date_num":parseInt(moment(createAt).format("YYYYMMDD"))
	}

	await DuappResource.transaction(async t=>{
		if ( currentProduct === null ) {
			await SellProductDetailTotal.create(saveData,{transaction:t})
			console.log()
			console.log("-----------")
			console.log("创建新数据")
			console.log("-----------")
			console.log()

		} else {
			await SellProductDetailTotal.update(saveData,{
				where:{
					"sku":sku,
					"create_at":createAt
				},
				transaction:t
			})
			console.log()
			console.log("-----------")
			console.log("更新已有数据")
			console.log("-----------")
			console.log()
		}
	})

}














exports.get = routerGet
exports.post = routerPost