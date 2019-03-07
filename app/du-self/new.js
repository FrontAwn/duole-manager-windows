const path = require("path")
const Common = require("../../utils/common.js")
const Request = require("../../utils/request.js")
const sign = require("../../config.js")["signEnv"]

const newSkuJsonPath = path.resolve(__dirname,"json/newSkus.json")
const newSkuRequest = {}

const getRequestUrl = sku=>{
	return `https://m.poizon.com/search/list?size=[]&title=${sku}&typeId=0&catId=0&unionId=0&sortType=0&sortMode=1&page=0&limit=20&sign=${sign}`
}

const getNewSkus = async ()=>{
	let where = {
		type:0
	}
	let attrs = ['sku']
	let res = await Request({
		url:"/du/self/getProductList",
		data:{
			where:JSON.stringify(where),
			attrs:JSON.stringify(attrs)
		}
	})
	let skus = []
	res["data"].forEach(content=>{
		skus.push(content.sku)
	})
	return skus;
}

const getNewSkuListResponse = async newSkus=>{
	for ( let [idx,sku] of newSkus.entries() ) {
		let url = getRequestUrl(sku)
		let response = await Common.httpsGet(url)
		response = JSON.parse(response)
		let productList = response['data']['productList']
		let productIds = []
		productList.forEach(content=>{
			productIds.push(content['product']['productId'])
		})
		newSkuRequest[sku] = productIds
	}
}

const writeNewSkuListResponse = async ()=>{
	await Common.writeFile(newSkuJsonPath,JSON.stringify(newSkuRequest))
	console.log(`----------> 一共写入${Object.keys(newSkuRequest).length}个新货号response信息`)
}

;(async ()=>{
	const newSkus = await getNewSkus()
	await getNewSkuListResponse(newSkus)
	await writeNewSkuListResponse()
})()
