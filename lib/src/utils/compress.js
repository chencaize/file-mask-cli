const path = require("path");
const fse = require("fs-extra");
const os = require("os");
const compressing = require("compressing")
const { isFile } = require("./file");

async function compress(data) {
    let tempname = path.resolve(os.tmpdir(), `temp1${new Date().getTime()}`);

    if (isFile(data)) {
        await compressing.zip.compressFile(data, tempname);
    } else {
        await compressing.zip.compressDir(data, tempname);
    }

    let readStream = await fse.readFile(tempname);

    await fse.remove(tempname);

    return readStream;
}

async function decompress(data, outputdir) {
    await compressing.zip.uncompress(data, outputdir);
}

module.exports = {
    compress,
    decompress,
}