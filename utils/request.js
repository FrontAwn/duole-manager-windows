const axios = require("axios")

var Http = null

const handleParams = requestParams=>{
	if ( !requestParams["url"] ) throw new Error("[Error] Request.HandleParams:没有传入url属性")
	let baseUrl = requestParams["baseUrl"] || "http://localhost:8800"
	Http = axios.create({
	   baseURL: baseUrl
	})
	let resultParams = {}
	let url = requestParams["url"];
	let method = requestParams["method"] || "get"
	let data = requestParams["data"] || {}
	let dataType = requestParams["dataType"] || "json"
	resultParams["url"] = url
	resultParams["method"] = method
	if ( method === "post" || method === "POST" ) {
	 if ( dataType === "json" ) {
	    resultParams['headers'] = {
	       "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
	    }
	 }
	 if ( dataType === "file" ) {
	    resultParams['headers']  = {
	       "Content-Type":"multipart/form-data"   
	    }
	 }
		 resultParams["data"] = data
	}

	if ( method === "get" || method === "GET" ) {
	 	resultParams["params"] = data
	}
	return resultParams
}

module.exports = requestParams=>{
	let self = this
	let resultParams = handleParams(requestParams);
	return new Promise((resolve,reject)=>{
		Http(resultParams)
			.then(res=>{
			   let resule= {
			      state:"success",
			      data:res['data']
			   }
			   resolve(resule)
			})
			.catch(err=>{
			   let resule= {
			      state:"error",
			      err,
			   }
			   resolve(resule)
			})
	})
}


