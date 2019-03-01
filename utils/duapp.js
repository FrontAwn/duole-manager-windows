const robot = require("./robot.js")
const common = require("./common.js")
const moment = require("moment")
const env = require("../env.js")
const request = require("./request.js")

var soldTotal = {}

exports.readyStart = async ()=>{
	await robot.clickWindowWhite()
}

exports.searchSku = async sku=>{
	sku = `${sku}`;
	await robot.clickSearchInput()
	await common.awaitTime(500)
	await robot.inputContent(sku)
	await common.awaitTime(500)
	await robot.clickEnter()
}

exports.cleanSku = async ()=>{
	await robot.clickSearchInput()
	await common.awaitTime(300)
	await robot.clickCleanButton()
}

exports.getSearchProduct = (products,idx)=>{
	if ( products[idx] ) {
		return products[idx]
	} else {
		process.exit("-------------->[Notice]: 没有对应货号信息了")
	}
} 

exports.rollSold = async ()=>{
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
}

exports.saveSoldDate = async (productId,dateStrings=[],dateScope=null)=>{
	let currentDate = moment().format("YYYY-MM-DD")
	if ( dateScope === null && env["soldDateScope"] ) {
		dateScope = env["soldDateScope"]
	}
	if ( dateScope === null ) { 
		dateScope = 1
	}
	if ( typeof dateScope === "string" && dateScope.includes("-") ) {
		dateScope = moment(currentDate).diff(dateScope,'day')
	}
	if ( dateStrings.length === 0 ) return true

	if ( dateStrings.length > 0 ) {
		for ( let [idx,content] of dateStrings.entries() ) {
			let dateString = content["time"]
			let size = parseFloat(content["size"])
			let date = common.parseDateString(dateString)
			let {diff,format} = date
			if ( diff === 0 ) continue
			if ( diff<=dateScope ) {
				if ( !soldTotal[format] ) soldTotal[format] = {}
				if ( !soldTotal[format][size] ) {
					soldTotal[format][size] = 1
				} else {
					soldTotal[format][size] += 1
				}
			} else {
				let res = JSON.stringify(soldTotal)
				await request({
					method:"post",
					url:"/du/self/setProductSoldDetail",
					data:{
						productId,
						soldDetail:res,
					}
				})
				return true
			}
		}
	}

	return false

}
