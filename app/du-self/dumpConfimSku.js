const moment = require("moment")
const Request = require("../../utils/request.js")

const getConfimProductUrls = async ()=>{
	let res = await Request({
		url:"/du/self/getConfimProductUrls"
	})
	return res['data'];
}

const getAlreadyDumpConfimProductIds = async ()=>{
	
}

const setConfimProductDetail = async urls=>{
	
}

;(async ()=>{
	let confimProductUrls = await getConfimProductUrls()
})()