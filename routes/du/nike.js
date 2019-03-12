const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const routerGet = {}
const routerPost = {}
const redis = database.getRedis()
const DuappResource = database.getMysql("DuappResource");
const NikeProductList = model.getModel("DuappResource","NikeProductList");
const NikeProductDetailTotal = model.getModel("DuappResource","NikeProductDetailTotal")

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
	let res = await NikeProductList.findAll({
		where,
		attributes:attrs,
		order,
		group,
		raw:true
	})
	ctx.body = res
}

routerGet.getProductsDetail = async ctx=>{
	let query = ctx.query
	let where = query['where'] ? JSON.parse(query['where']) : {
		id:{
			"$gt":0
		}
	}
	let attrs = query["attrs"] ? JSON.parse(query["attrs"]) : ["*"]
	let order = query["order"] ? JSON.parse(query["order"]) : []
	let group = query["group"] || ""
	let res = await NikeProductDetailTotal.findAll({
		where,
		attributes:attrs,
		order,
		group,
		raw:true
	})
	ctx.body = res
}

routerGet.addProductList = async ctx=>{
	let res = JSON.parse(ctx.query.res)	
	await DuappResource.transaction(async t=>{
		await NikeProductList.create(res,{transaction:t});
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
		await NikeProductList.update(content,{
			where,
			transaction:t
		});
	})
}

routerGet.setProductDetail = async ctx=>{
	let detail = JSON.parse(ctx.query.detail)
	let res = await NikeProductDetailTotal.findOne({
		raw:true,
		where:{
			"product_id":detail["product_id"],
			"create_at":detail["create_at"]
		}
	})
	await DuappResource.transaction(async t=>{
		if ( res === null ) {
			await NikeProductDetailTotal.create(detail,{transaction:t})
			console.log(`创建数据记录:product_id为${detail["product_id"]}`)
		} else {
			await NikeProductDetailTotal.update(detail,{
				where:{
					"product_id":detail["product_id"]
				},
				transaction:t
			})
			console.log(`更新数据记录:product_id为${detail["product_id"]}`)
		}
	})
}



routerPost.setProductSoldDetail = async ctx=>{
	let body = ""

	let end = async ()=>{
		body = JSON.parse(body)
		let { productId, soldDetail} = body
		console.log(`存储货号: ${productId}`)
		console.log(`存储信息: ${soldDetail}`)
		for (let [createAt,detail] of Object.entries(soldDetail)) {
			let res = {
				"sold_detail":JSON.stringify(detail)
			}
			await DuappResource.transaction(async t=>{
				await NikeProductDetailTotal.update(res,{
					where:{
						"product_id":productId,
						"create_at":createAt
					},
					transaction:t
				})
			})
		}
	}

	ctx.req.on("data",chunk=>{
		body += chunk
	})
	ctx.req.on("end",end)

}


exports.get = routerGet
exports.post = routerPost












