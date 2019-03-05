const Koa = require("koa")
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const common = require("./utils/common.js")
const getRouter = require("./router.js")
const server = new Koa()

;(async ()=>{
	let router = await getRouter()
	server
		.use(router.routes())
		.use(router.allowedMethods())
		.listen(8800,"localhost",()=>{
			console.log("server run success to http://localhost:8800")
		})
})()