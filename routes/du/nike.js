const path = require("path")
const database = require("../../utils/database.js")
const model = require("../../utils/model.js")
const common = require("../../utils/common.js")
const routerGet = {}
const routerPost = {}
const redis = database.getRedis()
const DuappResource = database.getMysql("DuappResource");
const NikeProductList = model.getModel("DuappResource","NikeProductList");

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


exports.get = routerGet
exports.post = routerPost












