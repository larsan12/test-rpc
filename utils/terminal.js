const term = require('terminal-kit').terminal;

const wait = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
module.exports.getInput = str => new Promise((resolve, reject) => {
    term.green(`${str}`);
    term.inputField((error, input) => {
        if (error) {
            return reject(error);
        }
        term('\n');
        resolve(input);
    });
});

module.exports.getMenuIndex = (str, items) => new Promise(async (resolve, reject) => {
    term.green(`\n${str}`);
    await wait(300);
    term.singleColumnMenu(items, (error, response) => {
        if (error) {
            return reject(error);
        }
        resolve(response.selectedIndex);
    });
});

module.exports.wait = wait;
