const path = require("path");
const chalk = require("chalk");
const fse = require("fs-extra");
const { Piscina } = require("piscina");
const { isObject, isEmpty, isArray, isJsonFile } = require("../utils/common");
const { ECCCryptoClassInstance } = require("../utils/crypto");
const { bufferToArray, arrayToBuffer } = require("../utils/byte")
const { isDirectory, isFile } = require("../utils/file");

//常量定义
const CONST_VIRS = {
    MODE: {
        SPLIT: "split",
        MERGE: "merge",
    },
    FILE_SPLIT_BUFFER: arrayToBuffer([0x1b, 0x1b, 0x1b, 0x1c, 0x1c, 0x1c]),
    SPINNER: {
        START: "任务开始执行...",
        EXEC: "任务执行中...%s",
        END: "任务执行完毕...",
        SPIN_STRING: "|/-\\",
    } //加载效果
};

class ConfigClass {
    //配置
    INPUT_DIR;//输入目录,绝对路径
    OUTPUT_DIR;//输出目录,绝对路径
    INCLUDE_FILES;//包含
    EXCLUDE_FILES;//不包含
    COMPRESS_PASSWORD;//压缩密码
    CRYPTO_FILE;//加解密文件,相对路径
    MASK_FILE;//遮掩文件,相对路径
    THREAD_NUMBER;//线程数
    RETRY_TIMES;//重试次数

    //internal
    CONST_VIRS;//常量
    HAS_CRYPTO_FILE_CONFIG;
    HAS_MASK_FILE_CONFIG;
    CRYPTO_KEY_PAIR; //公私钥
    MASK_FILE_INFO;//遮掩文件信息
    THREAD_POOL;//线程池

    constructor() {
        this.CONST_VIRS = CONST_VIRS;
        this.CRYPTO_KEY_PAIR = {};
        this.MASK_FILE_INFO = {
            stream: "",
            basename: "",
            extname: "",
        };
        this.HAS_CRYPTO_FILE_CONFIG = false;
        this.HAS_MASK_FILE_CONFIG = false;
        this.THREAD_POOL = undefined;
    }

    async init(mode, val) {

        if (!isObject(val)) {
            throw Error(`ConfigClass init:Param should be an object!`);
        }

        //赋值
        if (!isEmpty(val.INPUT_DIR)) {
            this.INPUT_DIR = val.INPUT_DIR.replaceAll("\\\\", "\\");
        } else {
            this.INPUT_DIR = process.cwd();
        }

        if (!isEmpty(val.OUTPUT_DIR)) {
            this.OUTPUT_DIR = val.OUTPUT_DIR.replaceAll("\\\\", "\\");
        } else {
            this.OUTPUT_DIR = path.resolve(this.INPUT_DIR, "output");
        }

        if (!isEmpty(val.INCLUDE_FILES)) {
            this.INCLUDE_FILES = new RegExp(val.INCLUDE_FILES);
        } else {
            this.INCLUDE_FILES = undefined;
        }

        if (!isEmpty(val.EXCLUDE_FILES)) {
            this.EXCLUDE_FILES = new RegExp(val.EXCLUDE_FILES);
        } else {
            this.EXCLUDE_FILES = undefined;
        }

        if (!isEmpty(val.COMPRESS_PASSWORD)) {
            this.COMPRESS_PASSWORD = String(val.COMPRESS_PASSWORD);
        } else {
            this.COMPRESS_PASSWORD = "aejk445458-*/+!~";
        }

        if (!isEmpty(val.CRYPTO_FILE)) {
            this.CRYPTO_FILE = path.resolve(this.INPUT_DIR, val.CRYPTO_FILE);
            this.HAS_CRYPTO_FILE_CONFIG = true;
        } else {
            this.CRYPTO_FILE = path.resolve(this.INPUT_DIR, "crypto.json");
            this.HAS_CRYPTO_FILE_CONFIG = false;
        }

        if (!isEmpty(val.MASK_FILE)) {
            this.MASK_FILE = path.resolve(this.INPUT_DIR, val.MASK_FILE);
            this.HAS_MASK_FILE_CONFIG = true;
        } else {
            this.HAS_MASK_FILE_CONFIG = false;
        }

        if (!isEmpty(val.THREAD_NUMBER)) {
            this.THREAD_NUMBER = parseInt(val.THREAD_NUMBER);
        } else {
            this.THREAD_NUMBER = 12;
        }

        if (!isEmpty(val.RETRY_TIMES)) {
            this.RETRY_TIMES = parseInt(val.RETRY_TIMES);
        } else {
            this.RETRY_TIMES = 3;
        }

        //处理
        if (!isDirectory(this.INPUT_DIR)) {
            throw Error(`ConfigClass init:${chalk.red("INPUT_DIR")} must be right directory,but got ${chalk.red(this.INPUT_DIR)}`);
        }

        switch (mode) {
            case CONST_VIRS.MODE.MERGE:
                await this.handleMerge();
                break;
            case CONST_VIRS.MODE.SPLIT:
                await this.handleSplit();
                break;
            default: break;
        }

        //构建线程池
        this.THREAD_POOL = new Piscina({
            filename: path.resolve(__dirname, "../utils/worker.js"),
            minThreads: this.THREAD_NUMBER,
            maxThreads: this.THREAD_NUMBER,
        })


        await fse.ensureDir(this.OUTPUT_DIR);
    }

    async handleMerge() {

        if (!isFile(this.MASK_FILE)) {
            throw Error(`ConfigClass handleMerge:${chalk.red("MASK_FILE")} should be a right file path,but got ${chalk.red(this.MASK_FILE)}`);
        } else {
            this.MASK_FILE_INFO = {
                stream: fse.readFileSync(this.MASK_FILE),
                basename: path.basename(this.MASK_FILE).split(".")[0],
                extname: path.extname(this.MASK_FILE),
            }
        }

        if (this.HAS_CRYPTO_FILE_CONFIG) {
            if (!isJsonFile(this.CRYPTO_FILE)) {
                throw Error(`ConfigClass handleMerge:${chalk.red("CRYPTO_FILE")} must be a json file,but got ${chalk.red(this.CRYPTO_FILE)}`)
            }
            if (!isFile(this.CRYPTO_FILE)) {
                throw Error(`ConfigClass handleMerge:${chalk.red("CRYPTO_FILE")} should be a right file path,but got ${chalk.red(this.CRYPTO_FILE)}`);
            }

            let key = await fse.readJSON(this.CRYPTO_FILE);
            this.CRYPTO_KEY_PAIR = {
                "publicKey": arrayToBuffer(key["publicKey"]),
                "privateKey": arrayToBuffer(key["privateKey"]),
            }
        } else {
            if (!isFile(this.CRYPTO_FILE)) {
                let key = await ECCCryptoClassInstance.generateKey();//生成key
                this.CRYPTO_KEY_PAIR = {
                    "publicKey": key["publicKey"],
                    "privateKey": key["privateKey"],
                }
                //写入文件
                fse.writeJSONSync(this.CRYPTO_FILE, {
                    "publicKey": bufferToArray(key["publicKey"]),
                    "privateKey": bufferToArray(key["privateKey"]),
                });
            } else {
                let key = await fse.readJSON(this.CRYPTO_FILE);
                this.CRYPTO_KEY_PAIR = {
                    "publicKey": arrayToBuffer(key["publicKey"]),
                    "privateKey": arrayToBuffer(key["privateKey"]),
                }
            }
        }

        if (isEmpty(this.CRYPTO_KEY_PAIR["publicKey"])) {
            throw Error(`ConfigClass handleMerge:MERGE ${chalk.red("publicKey")} should not be empty!`);
        }
    }

    async handleSplit() {
        if (this.HAS_CRYPTO_FILE_CONFIG) {
            if (!isJsonFile(this.CRYPTO_FILE)) {
                throw Error(`ConfigClass handleSplit:${chalk.red("CRYPTO_FILE")} must be a json file,but got ${chalk.red(this.CRYPTO_FILE)}`)
            }
            if (!isFile(this.CRYPTO_FILE)) {
                throw Error(`ConfigClass handleSplit:${chalk.red("CRYPTO_FILE")} should be a right file path,but got ${chalk.red(this.CRYPTO_FILE)}`);
            }

            let key = await fse.readJSON(this.CRYPTO_FILE);
            this.CRYPTO_KEY_PAIR = {
                "publicKey": arrayToBuffer(key["publicKey"]),
                "privateKey": arrayToBuffer(key["privateKey"]),
            }
        } else {
            if (!isFile(this.CRYPTO_FILE)) {
                throw Error(`ConfigClass handleSplit:${chalk.red("CRYPTO_FILE")} should be a right file path,but got ${chalk.red(this.CRYPTO_FILE)}`);
            } else {
                let key = await fse.readJSON(this.CRYPTO_FILE);
                this.CRYPTO_KEY_PAIR = {
                    "publicKey": arrayToBuffer(key["publicKey"]),
                    "privateKey": arrayToBuffer(key["privateKey"]),
                }
            }
        }

        if (isEmpty(this.CRYPTO_KEY_PAIR["privateKey"])) {
            throw Error(`ConfigClass handleSplit:SPLIT ${chalk.red("privateKey")} should not be empty!`);
        }
    }

    filter(val) {
        if (!isArray(val)) {
            throw Error(`ConfigClass filter:Param must be an array!`);
        }

        //特殊文件过滤
        let _val = val;

        _val = _val.filter((item) => {
            if ([this.CRYPTO_FILE, this.MASK_FILE, this.OUTPUT_DIR].includes(item)) {
                return false;
            }

            return true;
        })

        //正则过滤
        if (this.INCLUDE_FILES) {
            _val = _val.filter((item) => {

                if (this.INCLUDE_FILES.test(item)) {
                    return true;
                }

                return false;
            })
        }

        if (this.EXCLUDE_FILES) {
            _val = _val.filter((item) => {

                if (this.EXCLUDE_FILES.test(item)) {
                    return false;
                }

                return true;
            })
        }

        return _val;
    }
}

let ConfigClassInstance = new ConfigClass();

module.exports = ConfigClassInstance;