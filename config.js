module.exports = {
	// 抓取du list请求时所需要的令牌参数，每次抓取前更新
	signEnv:"78bcfe7b936cf8c9273283963bd43a2f",

	soldEnv:{
		type:"sellSold",

		// "current"
		// "history"
		mode:"current",


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

		stopDate:25,

	}
}

// 2019-02-25

// update sell_product_detail_total set sold_detail = "", sold_num = "", sold_last_id = "" where id > 0;

// delete from sell_product_detail_total where title = "";
