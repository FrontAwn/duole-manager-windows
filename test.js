const path = require("path")
const moment = require("moment")
const request = require("./utils/request")
const response = require("./utils/response")
const common = require("./utils/common")
const database = require("./utils/database")
const model = require("./utils/model")
const ejsexcel = require("ejsexcel")
const cheerio = require("cheerio")

const DuappResourceLocal = database.getMysql("DuappResource","local")
const DuappResourceRemote = database.getMysql("DuappResource","remote")

const SellProductDetailTotalLocal = model.getModel("DuappResource","SellProductDetailTotal","local")
const SellProductDetailTotalRemote = model.getModel("DuappResource","SellProductDetailTotal","remote")

// 把本地du数据同步到线上
const asnycSelfProductDetailsToRemote = async ()=>{

	let res = await SelfProductDetailTotalRemote.findOne({
		raw:true,
		attributes:["create_at"],
		order:[['create_at','DESC']]
	})

	let lastAt = res['create_at']
	let copyAt = moment(lastAt).add(1,'day').format("YYYY-MM-DD")
	let currAt = moment().format("YYYY-MM-DD")	
	let localNeedCopyDetails = await SelfProductDetailTotalLocal.findAll({
		raw:true,
		where:{
			create_at:{
				"$between":[copyAt,currAt]
			}
		},
		order:[["create_at","ASC"]],
	})	

	let chunks = common.spliceArray(localNeedCopyDetails)
	for ( let [idx,details] of chunks.entries() ) {
		await DuappResourceRemote.transaction(async t=>{
			await SelfProductDetailTotalRemote.bulkCreate(details,{transaction:t})
		})
	}
	console.log(`[Succsess]: 同步成功${localNeedCopyDetails.length}条数据`)
	process.exit()
}

// 导出当天详情数据
const exportDatas = async ()=>{
	let currentDateString = moment().format("YYYY-MM-DD")
	let beforeDateString = moment(currentDateString).subtract(1,'day').format("YYYY-MM-DD")


 	let currentDateNum = parseInt(moment(currentDateString).format("YYYYMMDD"))
 	let beforeDateNum = parseInt(moment(beforeDateString).format("YYYYMMDD"))
	
	let productDetails = await SellProductDetailTotalRemote.findAll({
		attributes:["sku","title","price","size_list","sold_total"],
		where:{
			date_num:currentDateNum
		},
		raw:true
	})

	let productSolds = await SellProductDetailTotalRemote.findAll({
		attributes:["sku","sold_detail","sold_num"],
		where:{
			date_num:beforeDateNum
		},
		raw:true
	})

	productSolds = common.indexBy(productSolds,"sku")

	let res = []

	for ( let [idx,detail] of productDetails.entries() ) {
		let { sku, title, price } = detail
		let sizeList = JSON.parse(detail["size_list"])
		let soldTotal = parseInt(detail["sold_total"])
		let soldDetail = null
		let soldNum = null
		if ( productSolds[sku] ) {
			soldDetail = JSON.parse(productSolds[sku]["sold_detail"])
			soldNum = productSolds[sku]["sold_num"]
		}
		for (let [size,num] of Object.entries(sizeList) ) {
			let content = {
				sku,
				title,
				soldTotal,
				size,
				price:num,
			}
			if ( soldDetail !== null && soldDetail[size] ) {
				content["soldDetail"] = soldDetail[size]
			} else {
				content["soldDetail"] = "--"
			}

			if ( soldNum !== null ) {
				content["soldNum"] = parseInt(soldNum)
			} else {
				content["soldNum"] = "--"
			}

			res.push(content)
		}
	}

	let templateBuffer = await common.readFile(path.resolve(__dirname,"./template/毒app抓取数据_template.xlsx"))
    const excelBuffer = await ejsexcel.renderExcel(templateBuffer, res);

    await common.writeFile(path.resolve(
    	__dirname,
    	`../毒app${currentDateNum}.xlsx`
    ),excelBuffer)
    console.log("Succsess")
}






;(async ()=>{


})()






















