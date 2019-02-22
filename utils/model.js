const databases = require("./database.js")
const modelConfig = require("../config/model.config.js")
const DuappResourceLocal = databases['DuappResourceLocal']
const DuappResourceRemote = databases['DuappResourceRemote']
const SjResourceLocal = databases['SjResourceLocal']
const SjResourceRemote = databases['SjResourceRemote']

const NikeProductList = {
	"local":DuappResourceLocal.define(
		modelConfig['NikeProductList']['tableName'],
		modelConfig['NikeProductList']['structure'],
		modelConfig['NikeProductList']['extra'],
	),
	"remote":DuappResourceRemote.define(
		modelConfig['NikeProductList']['tableName'],
		modelConfig['NikeProductList']['structure'],
		modelConfig['NikeProductList']['extra'],
	),
}

const SelfProductList = {
	"local":DuappResourceLocal.define(
		modelConfig['SelfProductList']['tableName'],
		modelConfig['SelfProductList']['structure'],
		modelConfig['SelfProductList']['extra'],
	),
	"remote":DuappResourceRemote.define(
		modelConfig['SelfProductList']['tableName'],
		modelConfig['SelfProductList']['structure'],
		modelConfig['SelfProductList']['extra'],
	),
}

const DuSkuList = {
	"local":SjResourceLocal.define(
		modelConfig['DuSkuList']['tableName'],
		modelConfig['DuSkuList']['structure'],
		modelConfig['DuSkuList']['extra'],
	),
	"remote":SjResourceRemote.define(
		modelConfig['DuSkuList']['tableName'],
		modelConfig['DuSkuList']['structure'],
		modelConfig['DuSkuList']['extra'],
	),
}

const DuSkuDetail = {
	"local":SjResourceLocal.define(
		modelConfig['DuSkuDetail']['tableName'],
		modelConfig['DuSkuDetail']['structure'],
		modelConfig['DuSkuDetail']['extra'],
	),
	"remote":SjResourceRemote.define(
		modelConfig['DuSkuDetail']['tableName'],
		modelConfig['DuSkuDetail']['structure'],
		modelConfig['DuSkuDetail']['extra'],
	),
}

exports.getNikeProductListModel = env=>{
	return NikeProductList[env]
}

exports.getSelfProductListModel = env=>{
	return SelfProductList[env]
}

exports.getDuSkuListModel = env=>{
	return DuSkuList[env]
}

exports.getDuSkuDetailModel = env=>{
	return DuSkuDetail[env]
}
