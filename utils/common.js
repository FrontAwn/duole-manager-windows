const fs = require("fs")
const path = require("path")
const util = require("util")
const url = require("url")
const http = require("http")
const https = require("https")
const qs = require("querystring")
const child_process = require("child_process")
const moment = require("moment")

exports.readFile = util.promisify(fs.readFile)

exports.writeFile = util.promisify(fs.writeFile)

exports.exec = util.promisify(child_process.exec)

exports.urlParse = url.parse

exports.urlStringify = url.parse.stringify

exports.qsParse = qs.parse

exports.qsStringify = qs.stringify 

exports.checkFile = filePath=>{
	return new Promise((resolve,reject)=>{
		fs.access(filePath,fs.constants.F_OK, err=>{
			if (!err) {
				resolve(true)
			} else {
				resolve(false)
			}
		})
	})
}

exports.readDirectory = directoryPath=>{
	return new Promise((resolve,reject)=>{
		fs.readdir(directoryPath,(err,files)=>{
			if (!err) {
				resolve(files)
			} else {
				resolve(null)
			}
		})
	})
}

exports.awaitTime = time=>{
	return new Promise((resolve,reject)=>{
		setTimeout(()=>{
			resolve(true)
		},time)
	})
}

exports.httpGet = url=>{
	return new Promise((resolve,reject)=>{
		http.get(url,res=>{
			let datas = ""
			res.on("data",chunk=>{
				datas += chunk
			})
			res.on("end",()=>{
				resolve(datas)
			})
		})
	})
}

exports.httpsGet = url=>{
	return new Promise((resolve,reject)=>{
		https.get(url,res=>{
			let datas = ""
			res.on("data",chunk=>{
				datas += chunk
			})
			res.on("end",()=>{
				resolve(datas)
			})
		})
	})
}

exports.deepCopy = obj =>{
	return JSON.parse(JSON.stringify(obj))
}

// exports.parseDateString = dateString => {
// 	let currentDate = moment().format("YYYY-MM-DD")
// 	let soldDate = ""
// 	if ( dateString.indexOf("分钟前") !== -1 || 
// 		 dateString.indexOf("秒钟前") !== -1 || 
// 		 dateString.indexOf("小时前") !== -1 ||
// 		 dateString.indexOf("刚刚") !== -1
// 	) {
// 		soldDate = currentDate
// 	}

// 	if ( dateString.indexOf("天前") !== -1 ) {
// 		let beforeDay = parseInt(dateString)
// 		soldDate = moment().subtract(beforeDay,'day').format("YYYY-MM-DD")
// 	}

// 	if ( dateString.indexOf("月") !== -1 ) {
// 		let dateInfoArray = dateString.split("月")
// 		let month = parseInt(dateInfoArray[0])
// 		let day = parseInt(dateInfoArray[1])
// 		let year = moment().format("YYYY")
// 		if ( month < 10 ) {
// 			month = `0${month}`
// 		}
// 		if ( day < 10 ) {
// 			day = `0${day}`
// 		}
// 		soldDate = `${year}-${month}-${day}`
// 	}

// 	let diffDay = moment(currentDate).diff(soldDate,'day')
// 	if ( diffDay <= 7 ) {
// 		if ( !currentProductSolds[diffDay] ) {
// 			for (let idx=dayIdx; idx<=diffDay; idx++) {
// 				let soldNum = null
// 				let date = null
// 				if ( idx != diffDay ) {
// 					soldNum = 0
// 					date = moment().subtract(idx,'day').format("YYYY-MM-DD")
// 				} else {
// 					soldNum = 1
// 					date = soldDate
// 				}
// 				currentProductSolds[idx] = {
// 					soldNum,
// 					soldDate:date
// 				}
// 			}
// 			dayIdx = parseInt(diffDay)+1;
// 		} else {
// 			currentProductSolds[diffDay]["soldNum"] +=1
// 		}
// 		return true
// 	} else {
// 		return false
// 	}
// }
