const databases = require("./database.js")
const modelConfig = require("../config/model.config.js")
const mysqlEnv = require("../env.js")["mysqlEnv"]

exports.getModel = (dbName,modelName,dbEnv=null)=>{
	if ( dbEnv === null ) dbEnv = mysqlEnv
	let db = databases.getMysql(dbName,dbEnv)
	return db.define(
		modelConfig[modelName]["tableName"],
		modelConfig[modelName]["structure"],
		modelConfig[modelName]["extra"]
	)
}


