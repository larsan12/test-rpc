/* eslint-disable require-jsdoc */
const net = require('net');
const log = require('terminal-kit').terminal.blue;

class Server {
    static init(port) {
        return new Promise(resolve => {
            this._name = `Получатель ${port % 100}`;
            const server = new net.Server();
            server.on('connection', socket => {
                log(`${this._name}: соединение установлено\n`);
                socket.on('data', this.onRequest);
                socket.on('error', err => log(`${this._name}: error`, err));
                Server.socket = socket;
            });
            server.listen(port, () => resolve());
        });
    }

    static onRequest(chunk) {
        // TODO
    }
}

module.exports = Server;
