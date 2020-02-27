/* eslint-disable require-jsdoc */
const net = require('net');
const log = require('terminal-kit').terminal.blue;
const RPC = require('./RPC');

class Server extends RPC {
    constructor(id, port, key) {
        super(key);
        this.id = id;
        this.port = port;
        this.name = `Получатель ${id}`;
    }

    init() {
        const that = this;
        return new Promise(resolve => {
            const server = new net.Server();
            server.on('connection', socket => {
                log(`${this.name} - соединение установлено\n`);
                socket.on('data', this.onRequest.bind(that));
                socket.on('error', err => log(`${this.name} - error`, err));
                that.socket = socket;
            });
            server.listen(this.port, () => resolve());
        });
    }

    onRequest(chunk) {
        const req = this.encode(chunk);
        // получаем идентификатор от клиента первым сообщением
        if (!this.client) {
            this.client = req.data;
            return;
        }
        log(`${this.name} - получено сообщение от отправителя ${this.client}: ${req.data}; время отправки: ${req.ts}`);
        log('\n');
        this.socket.write(this.createResponse('ok'));
    }
}

module.exports = Server;
