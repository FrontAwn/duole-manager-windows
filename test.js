const request = require("./utils/request")
const common = require("./utils/common")

;(async ()=>{
	await request({
		url:"/chrome/extension/putSelfNewProductUrl"
	})
})()