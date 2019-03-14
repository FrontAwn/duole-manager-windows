const Sequelize = require('sequelize');
let { STRING, DOUBLE, DATE, INTEGER } = Sequelize

const modelConfig = {
	"SelfProductList":{
		tableName:"self_product_list",
		structure:{
			id:{
				type:INTEGER(11).UNSIGNED,
				primaryKey:true,
				autoIncrement:true,
			},
			product_id:{
				type:STRING(100),
				allowNull:false,
				defaultValue:"",
			},
			title:{
				type:STRING(300),
				allowNull:false,
				defaultValue:'',
			},
			url:{
				type:STRING(500),
				allowNull:false,
				defaultValue:'',
			},
			sku:{
				type:STRING(100),
				allowNull:false,
				defaultValue:"",
			},
			type:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},
			create_at:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"self_product_list",
			timestamps: false,	
		}
	},
	"SelfProductDetailTotal":{
		tableName:"self_product_detail_total",
		structure:{
			id:{
				type:INTEGER(11).UNSIGNED,
				primaryKey:true,
				autoIncrement:true,
			},

			sku:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			item_id:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			price:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			product_id:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			title:{
				type:STRING(200),
				allowNull:false,
				defaultValue:'',
			},

			size_list:{
				type:STRING(3000),
				allowNull:false,
				defaultValue:'',
			},

			sold_total:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			sold_today_num:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			sold_detail:{
				type:STRING(1000),
				allowNull:false,
				defaultValue:'',
			},
			
			sell_date:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
			create_at:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"self_product_detail_total",
			timestamps: false,	
		}
	},

	"SellProductList":{
		tableName:"sell_product_list",
		structure:{
			id:{
				type:INTEGER(11).UNSIGNED,
				primaryKey:true,
				autoIncrement:true,
			},
			product_id:{
				type:STRING(100),
				allowNull:false,
				defaultValue:"",
			},
			title:{
				type:STRING(300),
				allowNull:false,
				defaultValue:'',
			},
			url:{
				type:STRING(500),
				allowNull:false,
				defaultValue:'',
			},
			sku:{
				type:STRING(100),
				allowNull:false,
				defaultValue:"",
			},
			type:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},
			brand:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},	
			sold_num:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
			create_at:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"sell_product_list",
			timestamps: false,	
		}
	},


	"SellProductDetailTotal":{
		tableName:"sell_product_detail_total",
		structure:{
			id:{
				type:INTEGER(11).UNSIGNED,
				primaryKey:true,
				autoIncrement:true,
			},

			sku:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			price:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			product_id:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			title:{
				type:STRING(200),
				allowNull:false,
				defaultValue:'',
			},

			size_list:{
				type:STRING(3000),
				allowNull:false,
				defaultValue:'',
			},

			sold_total:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			sold_num:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			sold_detail:{
				type:STRING(5000),
				allowNull:false,
				defaultValue:'',
			},
			
			sold_last_id:{
				type:STRING(300),
				allowNull:false,
				defaultValue:'',
			},
			brand:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},
			create_at:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"sell_product_detail_total",
			timestamps: false,	
		}
	},


}

module.exports = modelConfig