/* eslint-disable require-jsdoc */
const net = require('net');
const log = require('terminal-kit').terminal.yellow;

class Client {
    static async init(recipients) {
        this.recipients = await Promise.all(recipients.map((rec, i) => Client.connect(rec, i)));
        log('Отправитель готов\n');
        // для получения ответов от сервера
        this.promises = [];
    }

    static connect(port, i) {
        return new Promise(resolve => {
            const client = new net.Socket();
            client.on('data', Client.onData(i));
            client.connect({port}, () => resolve(client));
        });
    }

    static onData(i) {
        return chunk => {
            if (this.promises[i]) {
                this.promises[i](chunk);
                delete this.promises[i];
            }
        };
    }

    static request(i, message) {
        return new Promise(resolve => {
            this.promises[i] = resolve;
            this.recipients[i].write(message);
        });
    }
}

module.exports = Client;
