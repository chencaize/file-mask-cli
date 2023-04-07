function isEmpty(data) {
    if (data === "") return true; //检验空字符串
    if (!data && data !== 0 && data !== "") return true; //检验 undefined 和 null 
    if (RegExp.prototype.isPrototypeOf(data)) return false;//校验正则
    if (Array.prototype.isPrototypeOf(data)) return data.length === 0;//校验空数组
    if (Map.prototype.isPrototypeOf(data) || Set.prototype.isPrototypeOf(data)) return data.size === 0;//检验空map和空set
    if (Object.prototype.isPrototypeOf(data)) return Object.keys(data).length === 0;  //检验空对象
    return false;
}

function isObject(data) {
    return Object.prototype.toString.call(data) === "[object Object]";
}

function isArray(data) {
    return Object.prototype.toString.call(data) === "[object Array]";
}

function isJsonFile(data) {
    return /\.json$/.test(data);
}

module.exports = {
    isEmpty,
    isObject,
    isArray,
    isJsonFile,
}