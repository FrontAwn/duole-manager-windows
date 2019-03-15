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
	detail["price"] = price
	detail["product_id"] = datas['detail']['productId']
	detail["title"] = datas["detail"]["title"]
	detail["size_list"] = JSON.stringify(sizeList)
	detail["sold_total"] = datas["detail"]["soldNum"]
	detail["create_at"] = moment().format("YYYY-MM-DD")
	detail["date_num"] = parseInt(moment().format("YYYYMMDD"))
	return detail;
}

exports.parseProductList = response => {
	response = JSON.parse(response)
	return response['data']['productList']
}

exports.parseProductSold = response => {
	response = JSON.parse(response)
	let soldList = response["data"]["list"]
	let lastId = response["data"]["lastId"]
	let list = []
	if ( soldList.length !== 0 ) {
		soldList.forEach(content=>{
			list.push({
				size:content["item"]["size"],
				date:content["formatTime"]
			})
		})
	}
	return {lastId,list}
}




