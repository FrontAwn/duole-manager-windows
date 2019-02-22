const sequelize = require("sequelize")
const configs = require("../config/mysql.config.js")

exports.DuappResourceRemote = new sequelize(
	configs['DuappResource']['remote']['database'],
	configs['DuappResource']['remote']['username'],
	configs['DuappResource']['remote']['password'],
	configs['DuappResource']['remote']['extra'],
)

exports.DuappResourceLocal = new sequelize(
	configs['DuappResource']['local']['database'],
	configs['DuappResource']['local']['username'],
	configs['DuappResource']['local']['password'],
	configs['DuappResource']['local']['extra'],
)

exports.SjResourceRemote = new sequelize(
	configs['SjResource']['remote']['database'],
	configs['SjResource']['remote']['username'],
	configs['SjResource']['remote']['password'],
	configs['SjResource']['remote']['extra'],
)

exports.SjResourceLocal = new sequelize(
	configs['SjResource']['local']['database'],
	configs['SjResource']['local']['username'],
	configs['SjResource']['local']['password'],
	configs['SjResource']['local']['extra'],
)
