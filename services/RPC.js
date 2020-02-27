/* eslint-disable require-jsdoc */
const crypto = require('crypto');
const iv = Buffer.alloc(16, 0);

class RPC {
    constructor(key) {
        this.key = crypto.scryptSync(key, 'salt', 24);
        this.algo = 'aes-192-cbc';
    }

    createRequest(data, method = 'echo') {
        const body = {
            method,
            data,
            ts: Date.now(),
        };
        const cipher = crypto.createCipheriv(this.algo, this.key, iv);
        let encrypted = cipher.update(JSON.stringify(body), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    createResponse(data) {
        const body = {
            result: data,
            ts: Date.now(),
        };
        const cipher = crypto.createCipheriv(this.algo, this.key, iv);
        let encrypted = cipher.update(JSON.stringify(body), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    encode(chunk) {
        const decipher = crypto.createDecipheriv(this.algo, this.key, iv);
        let decrypted = decipher.update(chunk.toString(), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }
}

module.exports = RPC;
