const Sequelize = require('sequelize');
let { STRING, DOUBLE, DATE, INTEGER } = Sequelize

const modelConfig = {
	"NikeProductList":{
		tableName:"nike_product_list",
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
			tableName:"nike_product_list",
			timestamps: false,	
		}
	},
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
	"DuSkuList":{
		tableName:"du_sku_list",
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

			type:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			state:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			total:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			total_name:{
				type:STRING(2000),
				allowNull:false,
				defaultValue:'',
			},

			target_name:{
				type:STRING(200),
				allowNull:false,
				defaultValue:'',
			},

			image:{
				type:STRING(200),
				allowNull:false,
				defaultValue:'',
			},

			offset:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:1,
			},

			except_content:{
				type:STRING(300),
				allowNull:false,
				defaultValue:'',
			},

			create_time:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			update_time:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"du_sku_list",
			timestamps: false,	
		}
	},
	"DuSkuDetail":{
		tableName:"du_sku_detail",
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
				type:INTEGER(11).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			price:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			product_id:{
				type:INTEGER(11).UNSIGNED,
				allowNull:false,
				defaultValue:0,
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

			sold_num:{
				type:INTEGER(11).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			sell_date:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},

			sold_num:{
				type:INTEGER(4).UNSIGNED,
				allowNull:false,
				defaultValue:0,
			},

			update_time:{
				type:STRING(100),
				allowNull:false,
				defaultValue:'',
			},
		},
		extra: {
			tableName:"du_sku_detail",
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
	"NikeProductDetailTotal":{
		tableName:"nike_product_detail_total",
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
			tableName:"nike_product_detail_total",
			timestamps: false,	
		}
	},
}

module.exports = modelConfig