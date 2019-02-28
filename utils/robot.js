const robot = require("robotjs")
const common = require("./common.js")
const config = {
	"windows":{
		"DUAPP_WINDOW_WHITE_POSITION": {x:20,y:368},
		"DUAPP_SEARCH_INPUT_POSITION":{x:893,y:97},
		"DUAPP_CLEAN_SEARCH_INPUT_BUTTON_POSITION":{x:1194,y:96},
		"DUAPP_ROLL_BUTTOM_POSITION":{x:939,y:1000},
		"DUAPP_ROLL_TOP_POSITION":{x:939,y:168},
	},
	"mac":{
		"DUAPP_CLIENT_WHITE_POSITION": {},
		"DUAPP_SEARCH_INPUT_POSITION":{},
		"DUAPP_CLEAN_SEARCH_INPUT_BUTTON_POSITION":{},
		"DUAPP_ROLL_BUTTOM_POSITION":{},
		"DUAPP_ROLL_TOP_POSITION":{},
	},
	"shared":{
		"DUAPP_ENTER_BUTTON":"enter",
		"DUAPP_BACK_BUTTON":"e",
		"DUAPP_TOTAL_SOLD_BUTTON":"i",
	}
}

const robotEnv = require("../env.js")["robotEnv"]

const fullConfig = {...config[robotEnv],...config["shared"]}

exports.config = fullConfig

exports.clickWindowWhite = async ()=>{
	robot.moveMouse(fullConfig["DUAPP_WINDOW_WHITE_POSITION"]["x"],fullConfig["DUAPP_WINDOW_WHITE_POSITION"]["y"]);
	await common.awaitTime(300)
	robot.mouseClick();
	robot.mouseClick();
	robot.mouseClick();
}

exports.clickSearchInput = async ()=>{
	robot.moveMouse(fullConfig["DUAPP_SEARCH_INPUT_POSITION"]["x"],fullConfig["DUAPP_SEARCH_INPUT_POSITION"]["y"]);
	await common.awaitTime(300)
	robot.mouseClick();
	await common.awaitTime(300)
	robot.mouseClick();
}

exports.clickCleanButton = async ()=>{
	robot.moveMouse(fullConfig['DUAPP_CLEAN_SEARCH_INPUT_BUTTON_POSITION']['x'],fullConfig['DUAPP_CLEAN_SEARCH_INPUT_BUTTON_POSITION']['y']);
	await common.awaitTime(300)
	robot.mouseClick();
	await common.awaitTime(300)
	robot.mouseClick();
}

exports.clickEnter = async ()=>{
	robot.keyTap(fullConfig["DUAPP_ENTER_BUTTON"])
}

exports.clickBack = async ()=>{
	robot.keyTap(fullConfig["DUAPP_BACK_BUTTON"])
}

exports.clickTotalSold =async ()=>{
	robot.keyTap(fullConfig["DUAPP_TOTAL_SOLD_BUTTON"])
}

exports.rollWindow = async ()=>{
	robot.moveMouse(fullConfig["DUAPP_ROLL_BUTTOM_POSITION"]["x"],fullConfig["DUAPP_ROLL_BUTTOM_POSITION"]["y"])
	await awaitTime(800)
	robot.mouseToggle("down");
	robot.dragMouse(fullConfig["DUAPP_ROLL_TOP_POSITION"]["x"],fullConfig["DUAPP_ROLL_TOP_POSITION"]["y"]);
	robot.mouseToggle("up");
}

exports.clickDetail = async num=>{
	robot.keyTap(`f${num}`)
}

exports.inputContent = (content,delay=null)=>{
	if ( delay === null ) {
		robot.typeString(content)
	} else {
		robot.typeStringDelayed(content,delay)
	}
}

