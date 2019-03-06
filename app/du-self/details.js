const path = require("path")
const moment = require("moment")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const captureProductDetailParser = require("../../libs/du/captureProductDetailParser.js")

captureProductDetailParser({
	getProducts:async ()=>{
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
	},

	setDetail:async detail=>{
		await request({
			url:"/du/self/putConfimSkuDetail",
			data:{
				detail:JSON.stringify(detail),
			}
		})
	},

	getAlreadyCapture:"/du/self/getAlreadyCaptureByDetail",
	setAlreadyCapture:"/du/self/setAlreadyCaptureByDetail",
	cleanAlreadyCapture:"/du/self/cleanAlreadyCaptureByDetail"
})












