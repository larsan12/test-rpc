/* eslint-disable require-jsdoc */
const net = require('net');
const log = require('terminal-kit').terminal.yellow;
const RPC = require('./RPC');

class Client extends RPC {
    constructor(id, key) {
        super(key);
        this.id = id;
        this.name = `Отправитель ${id}`;
    }

    async init(recipients) {
        this.recipients = await Promise.all(recipients.map((rec, i) => this.connect(rec, i)));
        log(`${this.name} готов\n`);
        // для ожидания ответов от серверов
        this.promises = [];
    }

    connect(port, i) {
        return new Promise(resolve => {
            const client = new net.Socket();
            client.on('data', this.onData(i));
            client.connect({port}, () => {
                client.write(this.createRequest(this.id.toString(), 'init'));
                resolve(client);
            });
        });
    }

    onData(i) {
        return chunk => {
            if (this.promises[i]) {
                this.promises[i](chunk);
                delete this.promises[i];
            }
        };
    }

    /*
     * пока что только один одновременный запрос к каждому клиенту
     */
    request(i, message) {
        return new Promise(resolve => {
            this.promises[i] = resolve;
            this.recipients[i].write(this.createRequest(message));
        });
    }

    async sendRequest(i, message) {
        if (i === this.recipients.length) {
            const result = await Promise.all(this.recipients.map((v, i) => this.request(i, message)));
            // eslint-disable-next-line max-len
            log(`${this.name} - запрос ко всем с результатом:\n${result.map((v, i) => `Получатель ${i + 1} - ${this.encode(v).result}`).join('\n')}`);
            return;
        }
        const chunk = await this.request(i, message);
        const res = this.encode(chunk);
        log(`${this.name} - запрос к Получатель ${i + 1}: ${res.result} \n`);
    }
}

module.exports = Client;
