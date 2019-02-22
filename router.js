const http = require("http")
const KoaRouter = require("koa-router")
const database = require("./utils/database.js")
const model = require("./utils/model.js")
const common = require("./utils/common.js")
const DuappResourceRemote = database["DuappResourceRemote"]
const NikeProductListRemote = model.getNikeProductListModel("remote")
const SelfProductListRemote = model.getSelfProductListModel("remote")
var router = new KoaRouter()

router.get("/du/self/getConfimProductIds",async ctx=>{
	let res = await SelfProductListRemote.findAll({
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

router.get("/du/self/getConfimProductUrls",async ctx=>{
	let res = await SelfProductListRemote.findAll({
		raw:true,
		attributes:["url"],
		where:{
			type:2,
			url:{
				"$ne":""
			}
		}
	})
	let productUrls = []
	res.forEach(content=>{
		productUrls.push(content['url'])
	})
	ctx.body = productUrls
})


router.get("/du/self/getAlreadyDumpConfimProductIds",async ctx=>{
	
})

router.get("/du/self/setConfimProductUrl",async ctx=>{
	let url = ctx.query.url
	let urlObject = common.urlParse(url)
	let query = common.qsParse(urlObject['query'])
	let productId = query['productId']
	let res = {
		"url":url
	}
	await DuappResourceRemote.transaction(async t=>{
		await SelfProductListRemote.update(res,{
			where:{
				"product_id":productId
			},
			transaction:t
		})
	})
	ctx.body = `${productId} save succsess`
})




module.exports = router