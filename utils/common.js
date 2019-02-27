const fs = require("fs")
const path = require("path")
const util = require("util")
const url = require("url")
const http = require("http")
const https = require("https")
const qs = require("querystring")
const child_process = require("child_process")

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

