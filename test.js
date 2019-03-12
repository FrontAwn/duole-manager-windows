const path = require("path")
const moment = require("moment")
const request = require("./utils/request")
const response = require("./utils/response")
const common = require("./utils/common")
const database = require("./utils/database")
const model = require("./utils/model")

const DuappResourceLocal = database.getMysql("DuappResource","local")
const DuappResourceRemote = database.getMysql("DuappResource","remote")

const SelfProductDetailTotalLocal = model.getModel("DuappResource","SelfProductDetailTotal","local")
const SelfProductDetailTotalRemote = model.getModel("DuappResource","SelfProductDetailTotal","remote")

const ruleSoldJson = path.resolve(__dirname,"./json/ruleSold.json")


const CaptureCache = require("./libs/du/cache.js")

// 把本地du数据同步到线上
const asnycSelfProductDetailsToRemote = async ()=>{

	let res = await SelfProductDetailTotalRemote.findOne({
		raw:true,
		attributes:["create_at"],
		order:[['create_at','DESC']]
	})

	let lastAt = res['create_at']
	let copyAt = moment(lastAt).add(1,'day').format("YYYY-MM-DD")
	let currAt = moment().format("YYYY-MM-DD")	
	let localNeedCopyDetails = await SelfProductDetailTotalLocal.findAll({
		raw:true,
		where:{
			create_at:{
				"$between":[copyAt,currAt]
			}
		},
		order:[["create_at","ASC"]],
	})	

	let chunks = common.spliceArray(localNeedCopyDetails)
	for ( let [idx,details] of chunks.entries() ) {
		await DuappResourceRemote.transaction(async t=>{
			await SelfProductDetailTotalRemote.bulkCreate(details,{transaction:t})
		})
	}
	console.log(`[Succsess]: 同步成功${localNeedCopyDetails.length}条数据`)
	process.exit()
}






;(async ()=>{
	// let res = await request({
	// 	url:"/du/self/getAlreadyDumpProductIds"
	// })

	// await request({
	// 	url:"/du/self/setAlreadyCaptureByDetail",
	// 	data:{
	// 		productId:"9937"
	// 	}
	// })

	// await request({
	// 	url:"/du/self/cleanAlreadyCaptureByDetail",
	// })
	
	// await request({
	// 	url:"/du/self/cleanAlreadyCaptureBySold"
	// })

	// let content = await common.readFile(ruleSoldJson)
	// let datas = response.parseProductSold(content.toString())
	// for ( let [idx,content] of Object.entries(datas) ) {
	// 	console.log(common.parseDateString(content["time"]))
	// }


	// await CaptureUtils.cleanCurrentCaptureIndex()
	// await CaptureUtils.cleanAlreadyCaptureProductId("sold") 
	// await CaptureUtils.cleanAlreadyCaptureProductId("detail") 

	// process.exit()

	// let res = await request({
	// 	url:"/chrome/extension/getNikeNewProductIds"
	// })

	// await request({
	// 	url:"/chrome/extension/getSelfNewProductIds"
	// })

	// let detailResponse = await request({
	// 	url:"/du/nike/getProductsDetail",
	// 	data:{
	// 		where:JSON.stringify({
	// 			create_at:moment().format("YYYY-MM-DD"),
	// 		}),
	// 		attrs:JSON.stringify(["sku","product_id"])
	// 	}
	// })
	// let details = detailResponse["data"]
	// details = common.indexBy(details,"product_id")

	// let listResponse = await request({
	// 	url:"/du/nike/getProductList",
	// 	data:{
	// 		where:JSON.stringify({
	// 			sku:"",
	// 			type:2
	// 		}),
	// 		attrs:JSON.stringify(["product_id"])
	// 	}
	// })

	// let list = listResponse["data"]
	// for ( let [idx,content] of list.entries() ) {
	// 	if ( details[content["product_id"]] ) {
	// 		console.log()
	// 		let update = {
	// 			sku:details[content["product_id"]]["sku"]
	// 		}

	// 		await request({
	// 			url:"/du/nike/updateProductList",
	// 			data:{
	// 				where:JSON.stringify({
	// 					product_id:content["product_id"]
	// 				}),
	// 				content:JSON.stringify(update)
	// 			}
	// 		})

	// 		await common.awaitTime(300)
	// 	}
	// }




})()






















