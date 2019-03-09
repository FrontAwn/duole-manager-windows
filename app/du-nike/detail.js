const fs = require("fs")
const path = require("path")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureUtils = require("../../libs/du/utils.js")
const CaptureDetail = require("../../libs/du/captureDetail.js")

const getNeedCaptureProducts = async ()=>{
	let conditions = {
		where:JSON.stringify({
			type:2,
			url:{
				"$ne":""
			}
		})
	}
	let res = await request({
		url:"/du/nike/getProductList",
		data:conditions
	})

	return res["data"]
}

const getRestProducts = async (needCaptureProducts,alreadyCaptureProductIds)=>{
	let res = []
	if ( alreadyCaptureProductIds.length === 0 ) {
		res = common.deepCopy(needCaptureProducts)
	} else {
		for ( let [idx,content] of needCaptureProducts.entries() ) {
			if ( !alreadyCaptureProductIds.includes(content["product_id"]) ) {
				res.push(content)
			}
		}
	}
	return res;
}


;(async ()=>{

	await CaptureDetail({
		captureBefore: async ()=>{
			let conditions = {
				where:JSON.stringify({
					type:0
				})
			}
			let res = await request({
				url:"/du/self/getProductList",
				data:conditions
			})

			let datas = res["data"]
			let length = datas.length

			if ( length > 0 ) {
				console.log(`[Notice]: 当前存在个${length}新货号需要处理`)	
				process.exit()
			}
		},

		setCaptureProducts: async ()=>{
			let needCaptureProducts = await getNeedCaptureProducts();
			let alreadyCaptureProductIds = await CaptureUtils.getAlreadyCaptureProductId("detail")
			let products = await getRestProducts(needCaptureProducts,alreadyCaptureProductIds)
			return products;
		},

		getCaptureDetail: async detail=>{
			await request({
				url:"/du/nike/setProductDetail",
				data:{
					detail:JSON.stringify(detail),
				}
			})
		}
	})

})()












