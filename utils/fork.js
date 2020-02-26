const term = require('terminal-kit').terminal;
const cluster = require('cluster');

module.exports = numCPUs => {
    if (cluster.isMaster) {
        const recipients = [];
        let port = 55000;
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork({PORT: ++port});
            recipients.push(port);
        }

        cluster.on('exit', (worker, code, signal) => {
            term(`worker ${worker.process.pid} died\n`);
        });

        return recipients;
    }
};
