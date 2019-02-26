const path = require("path")
const moment = require("moment")
const Common = require("../../utils/common.js")
const Request = require("../../utils/request.js")
const ejsexcel = require("ejsexcel")

const templateFilePath = path.resolve(__dirname,"../../template/毒app抓取数据_template.xlsx")
const downloadPath = path.resolve(__dirname,"../../download")

const getCurrentDetails = async ()=>{
	let createAt = moment().format("YYYY-MM-DD")
	let where = {
		"create_at":createAt
	}
	let res = await Request({
		url:"/du/self/getProductDetails",
		data:{
			where:JSON.stringify(where)
		}
	})
	res = res["data"]
	let datas = []
	for ( let idx in res ) {
		let detail = res[idx]
		let sizeList = JSON.parse(detail["size_list"])
		for ( let [size,price] of Object.entries(sizeList) ) {
			datas.push({
				sku:detail['sku'],
				title:detail['title'],
				sold_total:detail['sold_total'],
				size,
				price
			})
		}
	}
	return datas
}

const generateExcelFile = async details=>{
	const fileName = `DuApp${moment().format("YYYYMMDD")}.xlsx`
	let templateBuffer = await Common.readFile(templateFilePath)
	let excelBuffer = await ejsexcel.renderExcel(templateBuffer,details)
	await Common.writeFile(`${downloadPath}/${fileName}`,excelBuffer)
}

;(async ()=>{
	let datas = await getCurrentDetails()
	await generateExcelFile(datas)
})()

