const sequelize = require("sequelize")
const redis = require("async-redis")
const mysqlConfig = require("../config/mysql.config.js")
const redisConfig = require("../config/redis.config.js")
const env = require("../env.js")
const mysqlEnv = env["mysqlEnv"]
const redisEnv = env["redisEnv"]

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

exports.getMysql = (dbName,dbEnv=null)=>{
	if ( dbEnv === null ) dbEnv =  mysqlEnv
	return new sequelize(
		mysqlConfig[dbName][dbEnv]['database'],
		mysqlConfig[dbName][dbEnv]['username'],
		mysqlConfig[dbName][dbEnv]['password'],
		mysqlConfig[dbName][dbEnv]['extra'],
	)
}

exports.getRedis = (dbName='default',dbEnv=null)=>{
	if ( dbEnv === null ) dbEnv =  redisEnv
	return redis.createClient(
		redisConfig[dbName][dbEnv]
	)
}
