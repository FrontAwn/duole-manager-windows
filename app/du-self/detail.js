const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CaptureDetail = require("../../libs/du/captureDetail.js")
const CaptureUtils = require("../../libs/du/utils.js")

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
		url:"/du/self/getProductList",
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
			} else {
				rl.question('当前已经没有货号可以抓取，是否清除缓存重新抓取(y/n)？', async (answer) => {
					if ( answer === "y" || answer === "Y" ) {
						await CaptureUtils.cleanCurrentCaptureIndex()
						await CaptureUtils.cleanAlreadyCaptureProductId("detail")
						console.log(`[Notice]: 当前已经清除已抓取缓存，可以重新抓取`)
						process.exit()
					} else {
						process.exit()
					}
				});
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
				url:"/du/self/putConfimSkuDetail",
				data:{
					detail:JSON.stringify(detail),
				}
			})
		}
	})

})()












