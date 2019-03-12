module.exports = {
	// 抓取du list请求时所需要的令牌参数，每次抓取前更新
	signEnv:"78bcfe7b936cf8c9273283963bd43a2f",
	// 抓取du sold detail数据的时间范围参数: 1=1天前，"2019-02-25"=抓取至2019-02-25为止
	soldConfig:{
		type:"nikeSold",
		dateScope:"2019-03-08",
		saveUrl:"/du/nike/setProductSoldDetail"
	},

	detailConfig:{

	},

	listConfig:{

	}
}

// 2019-02-25
