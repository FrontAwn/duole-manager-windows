const databases = require("./database.js")
const modelConfig = require("../config/model.config.js")
const DuappResource = databases.getDuappResource()
const SjResource = databases.getSjResource()

const NikeProductList = DuappResource.define(
	modelConfig['NikeProductList']['tableName'],
	modelConfig['NikeProductList']['structure'],
	modelConfig['NikeProductList']['extra'],  
)

const SelfProductList = DuappResource.define(
	modelConfig['SelfProductList']['tableName'],
	modelConfig['SelfProductList']['structure'],
	modelConfig['SelfProductList']['extra'],
)

const DuSkuList = SjResource.define(
	modelConfig['DuSkuList']['tableName'],
	modelConfig['DuSkuList']['structure'],
	modelConfig['DuSkuList']['extra'],
)

const DuSkuDetail = SjResource.define(
	modelConfig['DuSkuDetail']['tableName'],
	modelConfig['DuSkuDetail']['structure'],
	modelConfig['DuSkuDetail']['extra'],
)

const SelfProductDetailTotal = DuappResource.define(
	modelConfig['SelfProductDetailTotal']['tableName'],
	modelConfig['SelfProductDetailTotal']['structure'],
	modelConfig['SelfProductDetailTotal']['extra'],  
)

exports.getNikeProductList = ()=>{
	return NikeProductList
}

exports.getSelfProductList = ()=>{
	return SelfProductList
}

exports.getDuSkuList = ()=>{
	return DuSkuList
}

exports.getDuSkuDetail = ()=>{
	return DuSkuDetail
}

exports.getSelfProductDetailTotal = ()=>{
	return SelfProductDetailTotal
}
