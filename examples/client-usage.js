var EmanClient = require('../Client');

var logger = require('log4js').getLogger('[client-usage]');
logger.setLevel('DEBUG');

var config = {
    url: 'http://localhost:9001/communication',
    i_am: {
        name: 'test-client',
        key: 'test-client'
    }
};


var client = new EmanClient(logger, config);

client.connect()
    .then(() => {

        client.on('test', (event) => {

            var time = console.timeEnd('test');

            logger.info('GOT event', event.name);
            client.disconnect();
        });

        console.time('test');

        var message = 'test '.repeat(1000);
        var size = Buffer.byteLength(message, 'utf8');

        logger.info(`message size: ${size} bytes`);

        client.sendApiRequest({
            name: 'test',
            request_id: String(Math.random()),
            data: {
                message: message
            }
        });
    })
    .catch((data) => {
        logger.error(data.error.message);
    });
