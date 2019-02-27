const path = require("path")
const Common = require("../../utils/common.js")
const Request = require("../../utils/request.js")

const sign = "4eca3fc92f22f18b34d1630c42d04966"

const baseUrl = `https://m.poizon.com/search/list?size=[]&title=AQ1005-001%20%20&typeId=0&catId=0&unionId=0&sortType=0&sortMode=1&page=0&limit=20&sign=${sign}`

const newList = []

const getRequestUrl = sku=>{

}

const getNewProductSkus = async ()=>{
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
	return res;
}

const getNewSkuRequestList = async url=>{

}

const writeNewSkuList = async ()=>{

}

;(async ()=>{

	const newProductSkus = await getNewProductSkus()
	console.log(newProductSkus)

})()
