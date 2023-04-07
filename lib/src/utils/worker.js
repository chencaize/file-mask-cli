const path = require("path");
const fse = require("fs-extra");
const { ECCCryptoClassInstance, AesCryptoClassInstance } = require("./crypto");
const { compress, decompress } = require("./compress");
const { arrayToBuffer, bufferMerge, bufferSplit } = require("./byte");


function handleConfigClassInstance(data) {
    data.CONST_VIRS.FILE_SPLIT_BUFFER = arrayToBuffer(data.CONST_VIRS.FILE_SPLIT_BUFFER);
    data.CRYPTO_KEY_PAIR = {
        ...data.CRYPTO_KEY_PAIR,
        publicKey: arrayToBuffer(data.CRYPTO_KEY_PAIR.publicKey),
        privateKey: arrayToBuffer(data.CRYPTO_KEY_PAIR.privateKey),
    }
    data.MASK_FILE_INFO = {
        ...data.MASK_FILE_INFO,
        stream: arrayToBuffer(data.MASK_FILE_INFO.stream),
    }
}

async function merge({ fileDir, index, ConfigClassInstance }) {
    handleConfigClassInstance(ConfigClassInstance);

    let keyPair = ConfigClassInstance.CRYPTO_KEY_PAIR;//秘钥
    let maskFileStream = ConfigClassInstance.MASK_FILE_INFO.stream; //遮掩文件流
    let splitStream = ConfigClassInstance.CONST_VIRS.FILE_SPLIT_BUFFER;//分割符
    let newFileDir = path.resolve(ConfigClassInstance.OUTPUT_DIR, ConfigClassInstance.MASK_FILE_INFO.basename + index + ConfigClassInstance.MASK_FILE_INFO.extname);//输出文件名
    let retryTimes = ConfigClassInstance.RETRY_TIMES;//重试次数

    let curTime = 0, isSuccess = false;

    while (curTime < retryTimes && !isSuccess) {
        try {
            //压缩数据流
            let realFileStream = await compress(fileDir);

            realFileStream = await ECCCryptoClassInstance.encrypt(realFileStream, keyPair.publicKey);
            realFileStream = await AesCryptoClassInstance.encrypt(realFileStream, ConfigClassInstance.COMPRESS_PASSWORD);

            await fse.writeFile(newFileDir, bufferMerge([maskFileStream, realFileStream], splitStream));

            isSuccess = true;
        } catch (error) {

        }

        curTime++;

    }

    return { fileDir, index, result: isSuccess };
}

async function split({ fileDir, index, ConfigClassInstance }) {
    handleConfigClassInstance(ConfigClassInstance);

    let keyPair = ConfigClassInstance.CRYPTO_KEY_PAIR;//秘钥
    let splitStream = ConfigClassInstance.CONST_VIRS.FILE_SPLIT_BUFFER;//分割符
    let retryTimes = ConfigClassInstance.RETRY_TIMES;//重试次数

    let curTime = 0, isSuccess = false;

    while (curTime < retryTimes && !isSuccess) {
        try {
            let stream = await fse.readFile(fileDir);

            stream = bufferSplit(stream, splitStream);

            let realFileStream = stream[1];

            realFileStream = await AesCryptoClassInstance.decrypt(realFileStream, ConfigClassInstance.COMPRESS_PASSWORD);
            realFileStream = await ECCCryptoClassInstance.decrypt(realFileStream, keyPair.privateKey);

            realFileStream = await decompress(realFileStream, ConfigClassInstance.OUTPUT_DIR);

            isSuccess = true;
        } catch (error) {

        }
        
        curTime++;
    }

    return { fileDir, index, result: isSuccess };
}

module.exports = {
    merge,
    split,
}