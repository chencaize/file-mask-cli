const path = require("path");
const fse = require("fs-extra");
const chalk = require("chalk");
const ConfigClassInstance = require("./ConfigClass");
const Spinner = require("cli-spinner").Spinner;

class ExecClass {
    async exec(mode) {
        //遍历目录
        let dir = fse.readdirSync(ConfigClassInstance.INPUT_DIR);

        //绝对路径
        dir = dir.map(item => {
            return path.resolve(ConfigClassInstance.INPUT_DIR, item);
        })

        //过滤目录
        dir = ConfigClassInstance.filter(dir);

        //任务队列
        let tasks = [];

        dir.forEach((fileDir, index) => {
            tasks.push(ConfigClassInstance.THREAD_POOL.run({ fileDir, index, ConfigClassInstance }, { name: mode }));
        })

        console.log(ConfigClassInstance.CONST_VIRS.SPINNER.START);

        //加载效果
        const spinner = new Spinner(ConfigClassInstance.CONST_VIRS.SPINNER.EXEC);
        spinner.setSpinnerString(ConfigClassInstance.CONST_VIRS.SPINNER.SPIN_STRING);
        spinner.start();

        //执行线程池
        Promise.all(tasks).then(ress => {
            let success = 0, failure = 0, failureArrs = [];
            ress.forEach(res => {
                if (res.result) {
                    success++;
                } else {
                    failure++;
                    failureArrs.push(res.fileDir);
                }
            })
            spinner.stop();
            if (failure <= 0) {
                console.log(`\n${ConfigClassInstance.CONST_VIRS.SPINNER.END}`);
            } else {
                console.log(`\n${ConfigClassInstance.CONST_VIRS.SPINNER.END}成功了${chalk.green(success)}个,失败了${chalk.red(failure)}个,失败的为:${failureArrs.join(",")}`);
            }
        })
    }
}

let ExecClassInstance = new ExecClass();

module.exports = ExecClassInstance;