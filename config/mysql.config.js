const localHost = "127.0.0.1"
const remoteHost = "192.168.1.121"

const mysqlConfig = {
	"DuappResource":{
		"local":{
			'database':'duapp-resource',
			'username':'root',
			'password':'123456',
			'extra':{
				'host':localHost,
				'dialect':'mysql',
				'pool': {
				    max: 5,
				    min: 0,
				    acquire: 30000,
				    idle: 10000
				},
			},
		},
		"remote":{
			'database':'duapp-resource',
			'username':'song',
			'password':'SongAbc12345',
			'extra':{
				'host':remoteHost,
				'dialect':'mysql',
				'pool': {
				    max: 5,
				    min: 0,
				    acquire: 30000,
				    idle: 10000
				},
			},
		}
	},
	"SjResource": {
		"local":{
			'database':'sj-resource',
			'username':'root',
			'password':'123456',
			'extra':{
				'host':localHost,
				'dialect':'mysql',
				'pool': {
				    max: 5,
				    min: 0,
				    acquire: 30000,
				    idle: 10000
				},
			},
		},
		"remote":{
			'database':'sj-resource',
			'username':'song',
			'password':'SongAbc12345',
			'extra':{
				'host':remoteHost,
				'dialect':'mysql',
				'pool': {
				    max: 5,
				    min: 0,
				    acquire: 30000,
				    idle: 10000
				},
			},
		}
	}

}

module.exports = mysqlConfig

