
module.exports = {
	// 抓取du list请求时所需要的令牌参数，每次抓取前更新
	signEnv:"78bcfe7b936cf8c9273283963bd43a2f",

	soldEnv:{
		type:"sellSold",

		// "current"
		// "history"
		// "custom"
		mode:"custom",


		getProductListRequestConfig:{
			url:"/du/sell/getProductList",
			data:{
				attrs:JSON.stringify(["product_id","sku"]),
				where:JSON.stringify({
					type:2,
				}),	
			}
		},

		setProductSoldRequestConfig:{
			url:"/du/sell/updateProductSoldDetail"
		},
		startDate:"2019-03-18",
		stopDate:7,
	}
}


