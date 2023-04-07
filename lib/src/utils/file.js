const fse = require("fs-extra");

function isExist(data) {
    try {
        fse.statSync(data);
    } catch (error) {
        return false;
    }
    return true;
}

function isDirectory(data) {
    try {
        let fileStat = fse.statSync(data);
        if (!fileStat.isDirectory()) {
            return false;
        }
    } catch (error) {
        return false;
    }
    return true;
}

function isFile(data) {
    try {
        let fileStat = fse.statSync(data);
        if (!fileStat.isFile()) {
            return false;
        }
    } catch (error) {
        return false;
    }
    return true;
}

module.exports = {
    isExist,
    isDirectory,
    isFile,
}