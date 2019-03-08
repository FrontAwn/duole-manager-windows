const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const CaptureUtils = require("../../libs/du/utils.js")
const CaptureList = require("../../libs/du/captureList.js")
const sign = require("../../config.js")["signEnv"]

var newProducts = null
var captureList = {}

const captureBefore = async ()=>{
	let conditions = {
		where:JSON.stringify({type:0})
	}
	let res = await request({
		url:"/du/self/getProductList",
		data:conditions
	})

	if ( res["data"].length === 0 ) {
		console.log(`[Notice]: 当前没有新货号可以抓取`)
		process.exit()
	} else {
		newProducts = common.deepCopy(res["data"])
	}
}

const setCaptureProducts = async ()=>{
	return newProducts
}

const getCaptureList = async (list,sku)=>{
	let productIds = []
	if ( list.length > 0 ) {
		list.forEach(content=>{
			productIds.push(content['product']['productId'])
		})
	}
	captureList[sku] = productIds
}

const captureAfter = async ()=>{
	await CaptureUtils.setNewList(captureList)
	console.log(`[Notice]: 一共添加了${Object.keys(captureList).length}条new货号信息`)
	process.exit()
}

;(async ()=>{

	await CaptureList({
		captureType:"self",
		captureBefore,
		setCaptureProducts,
		getCaptureList,	
		captureAfter,
	})

})()



// const newSkuJsonPath = path.resolve(__dirname,"json/newSkus.json")
// const newSkuRequest = {}

// const getRequestUrl = sku=>{
// 	return `https://m.poizon.com/search/list?size=[]&title=${sku}&typeId=0&catId=0&unionId=0&sortType=0&sortMode=1&page=0&limit=20&sign=${sign}`
// }

// const getNewSkus = async ()=>{
// 	let where = {
// 		type:0
// 	}
// 	let attrs = ['sku']
// 	let res = await Request({
// 		url:"/du/self/getProductList",
// 		data:{
// 			where:JSON.stringify(where),
// 			attrs:JSON.stringify(attrs)
// 		}
// 	})
// 	let skus = []
// 	res["data"].forEach(content=>{
// 		skus.push(content.sku)
// 	})
// 	return skus;
// }

// const getNewSkuListResponse = async newSkus=>{
// 	for ( let [idx,sku] of newSkus.entries() ) {
// 		let url = getRequestUrl(sku)
// 		let response = await Common.httpsGet(url)
// 		response = JSON.parse(response)
// 		let productList = response['data']['productList']
// 		let productIds = []
// 		productList.forEach(content=>{
// 			productIds.push(content['product']['productId'])
// 		})
// 		newSkuRequest[sku] = productIds
// 	}
// }

// const writeNewSkuListResponse = async ()=>{
// 	await Common.writeFile(newSkuJsonPath,JSON.stringify(newSkuRequest))
// 	console.log(`----------> 一共写入${Object.keys(newSkuRequest).length}个新货号response信息`)
// }

// ;(async ()=>{
// 	const newSkus = await getNewSkus()
// 	await getNewSkuListResponse(newSkus)
// 	await writeNewSkuListResponse()
// })()
