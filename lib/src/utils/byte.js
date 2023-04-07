function bufferToArray(data) {
    let array = [];
    for (let i = 0; i < data.length; i++) {
        array.push(data[i]);
    }
    return array;
}

function arrayToBuffer(data) {
    let buffer = Buffer.from(data);
    return buffer;
}

function bufferMerge(data, split) {
    try {
        let _data = [];

        data.forEach(item => {
            _data.push(item);
            _data.push(split);
        })

        return Buffer.concat(_data);
    } catch (error) {
        console.error(error);
        return Buffer.from("");
    }
}

function bufferSplit(data, split) {
    try {
        let len = data.length, splitLen = split.length;
        let idx = 0;
        let result = [], temp = [];
        while (idx < len) {
            if (data[idx] == split[0]) {
                let isFind = true;
                for (let i = 1; i < splitLen; i++) {
                    if (data[idx + i] != split[i]) {
                        isFind = false;
                        break;
                    }
                }
                if (isFind) {

                    result.push(Buffer.from(temp));
                    temp = [];

                    idx += splitLen;
                } else {
                    temp.push(data[idx]);
                    idx++;
                }
            } else {
                temp.push(data[idx]);
                idx++;
            }
        }

        if (temp.length > 0) {
            result.push(Buffer.from(temp));
        }

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}


module.exports = {
    bufferToArray,
    arrayToBuffer,
    bufferMerge,
    bufferSplit,
}