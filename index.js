const cluster = require('cluster');
const term = require('terminal-kit').terminal;
const {wait, getInput, getMenuIndex} = require('./utils/terminal');
const fork = require('./utils/fork');
const Server = require('./services/server');
const Client = require('./services/client');


if (cluster.isMaster) {
    // ключ шифрования
    const key = '123123123123';

    /*
     * Запускаем тут клиента(отправителя)
     */

    const client = new Client(0, key);

    const sendRequet = async num => {
        const recipients = Array(num).fill(0).map((v, i) => i + 1);
        recipients.push(-1);
        const recipient = await getMenuIndex('Выберите получателя: ', recipients);
        const message = await getInput('Введите сообщение: ');
        await client.sendRequest(recipient, message);

        await sendRequet(num);
    };

    (async () => {
        term(`
        Реализован RPC поверх TCP с минимальным функционалом
        Голубым цветом в консоле пишут получатели
        Желтым - отправители
        `);
        term.grabInput();
        term.on('key', name => {
            if (name === 'CTRL_C') {
                term('\n\n\n\n\nExit\n');
                process.exit();
            }
        });
        const num = parseInt(await getInput('Введите колличество получателей(<100): '));

        // инициализируем получателей
        const recipients = fork(num, key);
        await wait(500);
        await client.init(recipients);
        await wait(500);

        // отсылаем запросы
        await sendRequet(recipients.length);
    })();
} else {
    /**
     * Запускаем тут сервера(получателей)
     * передаём через process.env порт, id, и ключ шифрования
     */
    const {PORT, ID, KEY} = process.env;
    const server = new Server(ID, PORT, KEY);
    (async () => {
        await server.init();
    })();
}
