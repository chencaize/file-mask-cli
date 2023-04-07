const crypto = require('crypto');
const eccrypto = require("eccrypto-js");

class AesCryptoClass {
    len = 256;
    algorithm = `aes-${this.len}-ecb`;
    keyLen = this.len / 8;
    iv = null;

    #padKey(key) {
        let res;
        if (key.length < this.keyLen) {
            res = key.padEnd(this.keyLen, "0");
        } else {
            res = key.slice(0, this.keyLen);
        }
        return res;
    }

    encrypt(data, key) {
        let secretKey = this.#padKey(key);
        const cipheriv = crypto.createCipheriv(this.algorithm, secretKey, this.iv);
        let val = Buffer.concat([cipheriv.update(data), cipheriv.final()]);

        return val;
    }

    decrypt(data, key) {
        let secretKey = this.#padKey(key);
        const decipheriv = crypto.createDecipheriv(this.algorithm, secretKey, this.iv);
        let val = Buffer.concat([decipheriv.update(data), decipheriv.final()]);
        return val;
    }
}

class ECCCryptoClass {
    async generateKey() {
        let keyPair = eccrypto.generateKeyPair();

        return {
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
        }
    }

    async encrypt(buffer, key) {
        const result = await eccrypto.encrypt(key, buffer);
        return eccrypto.serialize(result);
    }

    async decrypt(buffer, key) {
        let _buffer = eccrypto.deserialize(buffer);
        const result = await eccrypto.decrypt(key, _buffer);
        return result;
    }
}

const AesCryptoClassInstance = new AesCryptoClass();
const ECCCryptoClassInstance = new ECCCryptoClass();

module.exports = {
    AesCryptoClassInstance,
    ECCCryptoClassInstance
}