const cluster = require('cluster');
const term = require('terminal-kit').terminal;
const {wait, getInput, getMenuIndex} = require('./utils/terminal');
const fork = require('./utils/fork');
const Server = require('./services/server');
const Client = require('./services/client');


if (cluster.isMaster) {
    /**
     * Запускаем тут клиента(отправителя)
     */
    (async () => {
        term.grabInput();
        term.on('key', name => {
            if (name === 'CTRL_C') {
                term('\n\n\n\n\nExit\n');
                process.exit();
            }
        });
        const num = parseInt(await getInput('Введите колличество получателей(<100): '));
        const recipients = fork(num);
        await wait(500);
        await Client.init(recipients);
        await wait(500);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const items = [
                'a. Go south',
                'b. Go west',
                'c. Go back to the street',
            ];
            const index = await getMenuIndex('choose', items);
            term.green(`\n${index}`);
        }
    })();
} else {
    /**
     * Запускаем тут сервера(получателей)
     * передаём через process.env порт
     */
    const {PORT} = process.env;
    (async () => {
        await Server.init(PORT);
    })();
}
