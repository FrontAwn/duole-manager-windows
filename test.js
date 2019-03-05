const moment = require("moment")
const request = require("./utils/request")
const common = require("./utils/common")
const database = require("./utils/database")
const model = require("./utils/model")
const mysqlConfig = require("./config/mysql.config.js")
const modelConfig = require("./config/model.config.js")
const sequelize = require("sequelize")

const DuappResourceLocal = database.getDuappResource()
const DuappResourceRemote = new sequelize(
	mysqlConfig['DuappResource']["remote"]['database'],
	mysqlConfig['DuappResource']["remote"]['username'],
	mysqlConfig['DuappResource']["remote"]['password'],
	mysqlConfig['DuappResource']["remote"]['extra'],
)

const SelfProductDetailTotalLocal = model.getSelfProductDetailTotal()
const SelfProductDetailTotalRemote = DuappResourceRemote.define(
	modelConfig['SelfProductDetailTotal']['tableName'],
	modelConfig['SelfProductDetailTotal']['structure'],
	modelConfig['SelfProductDetailTotal']['extra'],
)

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
}






