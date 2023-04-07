const chalk = require("chalk");
const ExecClassInstance = require("./src/eneity/ExecClass");
const ConfigClassInstance = require("./src/eneity/ConfigClass");

async function hide(option) {
    let mode = ConfigClassInstance.CONST_VIRS.MODE.MERGE;
    try {
        await ConfigClassInstance.init(mode, option);//初始化配置
        await ExecClassInstance.exec(mode);//执行任务
    } catch (error) {
        console.error(chalk.white(error));
        process.exit();
    }
}

async function show(option) {
    let mode = ConfigClassInstance.CONST_VIRS.MODE.SPLIT;
    try {
        await ConfigClassInstance.init(mode, option);//初始化配置
        await ExecClassInstance.exec(mode);//执行任务
    } catch (error) {
        console.error(chalk.white(error));
        process.exit();
    }
}

module.exports = {
    hide,
    show,
}