const sequelize = require("sequelize")
const redis = require("async-redis")
const mysqlConfig = require("../config/mysql.config.js")
const redisConfig = require("../config/redis.config.js")
const env = require("../env.js")
const mysqlEnv = env["mysqlEnv"]
const redisEnv = env["redisEnv"]

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
