const sequelize = require("sequelize")
const mysqlConfig = require("../config/mysql.config.js")
const env = mysqlConfig["env"]
exports.getDuappResource = ()=>{
	return new sequelize(
		mysqlConfig['DuappResource'][env]['database'],
		mysqlConfig['DuappResource'][env]['username'],
		mysqlConfig['DuappResource'][env]['password'],
		mysqlConfig['DuappResource'][env]['extra'],
	)
}

exports.getSjResource = ()=>{
	return new sequelize(
		mysqlConfig['SjResource'][env]['database'],
		mysqlConfig['SjResource'][env]['username'],
		mysqlConfig['SjResource'][env]['password'],
		mysqlConfig['SjResource'][env]['extra'],
	)
}
