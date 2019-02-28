const moment = require("moment")

exports.parseProductDetail = response => {
	response = JSON.parse(response)
	let detail = {}
	if ( response["status"] != 200 ) return null
	let datas = response["data"]
	let sku = datas["detail"]["articleNumber"].toString().toUpperCase().trim()
	if ( sku.indexOf(' ') !== -1 ) {
		sku.replace(' ','-')
	}

	let price = "--"
	if ( datas["item"]["price"] && typeof parseInt(datas["item"]["price"]) === "number" ) {
		price = parseInt(datas["item"]["price"]) / 100
	}

	let sizeList = {}
	datas["sizeList"].forEach(sizeDetail=>{
		let size = sizeDetail["size"]
		let sizePrice = "--"
		if ( sizeDetail["item"] && !Array.isArray(sizeDetail["item"]) && sizeDetail["item"]["price"] ) {
			sizePrice = parseInt(sizeDetail["item"]["price"]) / 100
		}
		sizeList[size] = sizePrice
	})

	detail["sku"] = sku
	detail["item_id"] = datas["item"]["productItemId"]
	detail["price"] = price
	detail["product_id"] = datas['detail']['productId']
	detail["title"] = datas["detail"]["title"]
	detail["size_list"] = JSON.stringify(sizeList)
	detail["sold_total"] = datas["detail"]["soldNum"]
	detail["sell_date"] = datas["detail"]["sellDate"]
	detail["create_at"] = moment().format("YYYY-MM-DD")
	return detail;
}

exports.parseProductList = response => {
	
}

exports.parseProductSold = response => {
	
}




