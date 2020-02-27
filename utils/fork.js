const term = require('terminal-kit').terminal;
const cluster = require('cluster');

module.exports = (num, key) => {
    if (cluster.isMaster) {
        const recipients = [];
        let port = 55000;
        for (let i = 0; i < num; i++) {
            cluster.fork({PORT: ++port, ID: i + 1, KEY: key});
            recipients.push(port);
        }

        cluster.on('exit', (worker, code, signal) => {
            term(`worker ${worker.process.pid} died\n`);
        });

        return recipients;
    }
};
