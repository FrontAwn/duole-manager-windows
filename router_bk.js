const koaRouter = require("koa-router")
const database = require("./utils/database.js")
const model = require("./utils/model.js")
const common = require("./utils/common.js")
const DuappResource = database.getDuappResource()
const NikeProductList = model.getNikeProductList()
const SelfProductList = model.getSelfProductList()
const SelfProductDetailTotal = model.getSelfProductDetailTotal()
var router = new koaRouter()

// 获得当前可以抓取货号的ids [chrome extension]
router.get("/du/self/getConfimProductIds",async ctx=>{
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
})


// 给指定货号添加对应detail抓取的url [chrome extension]
router.get("/du/self/putConfimProductUrl",async ctx=>{
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
	ctx.body = `${productId} save succsess`
})

// router.get("/chrome/extension/getSelfProductIds",async ctx=>{
// 	let productIds = []
// 	let type = 2
// 	let query = ctx.query
// 	if ( query['type'] ) type = query['type']
// 	switch(type) {
// 		case 0:
// 			break;
// 		case 2:
// 			let res = await SelfProductList.findAll({
// 				raw:true,
// 				attributes:["product_id"],
// 				where:{
// 					type,
// 					url:""
// 				}
// 			})
// 			res.forEach(content=>{
// 				productIds.push(content['product_id'])
// 			})
// 			break;
// 	}
// 	ctx.body = productIds
// })

// router.get("/chrome/extension/putSelfProductUrl",async ctx=>{
// 	let type = 2
// 	let content = {}
// 	let query = ctx.query
// 	if ( query['type'] ) type = query['type']
// 	let url = query.url 
// 	let urlObject = common.urlParse(url)
// 	let query = common.qsParse(urlObject['query'])
// 	let productId = query['productId']
// 	switch(type) {
// 		case 0:
// 			break;
// 		case 2:
// 			break;
// 	}
// })


// // 存储对应confim sku已经抓取的数据
// router.get("/du/self/putConfimSkuDetail", async ctx=>{
// 	let detail = JSON.parse(ctx.query.detail)
// 	let res = await SelfProductDetailTotal.findOne({
// 		raw:true,
// 		where:{
// 			"product_id":detail["product_id"],
// 			"create_at":detail["create_at"]
// 		}
// 	})
// 	await DuappResource.transaction(async t=>{
// 		if ( res === null ) {
// 			await SelfProductDetailTotal.create(detail,{transaction:t})
// 			console.log(`创建数据记录:product_id为${detail["product_id"]}`)
// 		} else {
// 			await SelfProductDetailTotal.update(detail,{
// 				where:{
// 					"product_id":detail["product_id"]
// 				},
// 				transaction:t
// 			})
// 			console.log(`更新数据记录:product_id为${detail["product_id"]}`)
// 		}
// 	})
// })

// // 自定义搜索list
// router.get("/du/self/getProductList",async ctx=>{
// 	let query = ctx.query
// 	let where = query['where'] ? JSON.parse(query['where']) : {
// 		id:{
// 			"$gt":0
// 		}
// 	}
// 	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
// 	let order = query["order"] ? JSON.parse(query["order"]) : []
// 	let res = await SelfProductList.findAll({
// 		where,
// 		attributes:attrs,
// 		order,
// 		raw:true
// 	})
// 	ctx.body = res
// })

// // 自定义搜索detail
// router.get("/du/self/getProductDetails",async ctx=>{
// 	let query = ctx.query
// 	let where = query['where'] ? JSON.parse(query['where']) : {
// 		id:{
// 			"$gt":0
// 		}
// 	}
// 	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
// 	let order = query["order"] ? JSON.parse(query["order"]) : []
// 	let res = await SelfProductDetailTotal.findAll({
// 		where,
// 		attributes:attrs,
// 		order,
// 		raw:true
// 	})
// 	ctx.body = res
	
// })






















module.exports = router