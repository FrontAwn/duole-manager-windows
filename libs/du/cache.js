const moment = require("moment")
const common = require("../../utils/common.js")
const database = require("../../utils/database.js")
const redis = database.getRedis()

exports.getCacheHasMap = async (type,processId,key)=>{
	let hasKey = `/du/${type}/${processId}`
	let hasMap = await redis.hget(hasKey,key)
	return hasMap;
}

exports.setCacheHasMap = async (type,processId,key,value)=>{
	let hasKey = `/du/${type}/${processId}`
	let state = await redis.hset(hasKey,key,value)
	console.log(state)
}

exports.delCacheHasMap = async (type,processId,key)=>{
	let hasKey = `/du/${type}/${processId}`
	await redis.hdel(hasKey,key)
}

exports.cleanCacheHasMap = async (type,processId)=>{
	let hasKey = `/du/${type}/${processId}`
	await redis.del(hasKey)
}



exports.pushCacheLinked = async (type,processId,key,value)=>{
	let linkedKey = `/du/${type}/${processId}/${key}`
	await redis.rpush(linkedKey,value)
}

exports.popCacheLinked = async (type,processId,key)=>{
	let linkedKey = `/du/${type}/${processId}/${key}`
	let value = await redis.lpop(linkedKey)
	return value
}

exports.getCacheLinkedLength = async (type,processId,key)=>{
	let linkedKey = `/du/${type}/${processId}/${key}`
	let length = await redis.llen(linkedKey)
	return length;
}

exports.cleanCacheLinked = async (type,processId,key)=>{
	let linkedKey = `/du/${type}/${processId}/${key}`
	await redis.del(linkedKey)
}
