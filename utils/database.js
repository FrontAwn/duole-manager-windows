const sequelize = require("sequelize")
const mysqlConfig = require("../config/mysql.config.js")
const mysqlEnv = require("../config/env.config.js")["mysqlEnv"]
exports.getDuappResource = ()=>{
	return new sequelize(
		mysqlConfig['DuappResource'][mysqlEnv]['database'],
		mysqlConfig['DuappResource'][mysqlEnv]['username'],
		mysqlConfig['DuappResource'][mysqlEnv]['password'],
		mysqlConfig['DuappResource'][mysqlEnv]['extra'],
	)
}

exports.getSjResource = ()=>{
	return new sequelize(
		mysqlConfig['SjResource'][mysqlEnv]['database'],
		mysqlConfig['SjResource'][mysqlEnv]['username'],
		mysqlConfig['SjResource'][mysqlEnv]['password'],
		mysqlConfig['SjResource'][mysqlEnv]['extra'],
	)
}
