var EmanApi = require('../Api');

var logger = require('log4js').getLogger('[client-usage]');
// logger.setLevel('DEBUG');

var config = {
    eman: {
        url: 'http://localhost:9001/communication',
        i_am: {
            name: 'test-client',
            key: 'test-client'
        }
    }
};

var api = new EmanApi(logger, config);

var process = () => {

    //  emit single event, no response
    logger.info('emit "test" event');

    api.event('test').data({
        message: 'test'
    })
    .emit();


    // make request and wait response
    logger.info('make request');

    api.on('messages.post', (event) => {
        api.response(event).data({from: 'messages', result: true}).send();
    });

    api.on('companies.get', (event) => {
        api.response(event).data({from: 'companies', result: event.data}).send();

    });

    api.request('messages.post')
       .data({message: 'test2'}).timeout(300)
       .send()
       .then((data) => {
           logger.info('got response', data);
       })
       .catch((err) => {
           logger.error(err);
       });


     // making batch requests

     var batchRequest = api.batchRequest();

     batchRequest
         .request('messages.post').data({id: 1}).timeout(300).add()
         .request('companies.get').data({id: 100}).timeout(100).add()
         .send()
         .then((batch) => {
             logger.info(batch);
             api.disconnect();
         })
         .catch((error) => {
             logger.error(error);
         });
};

api.connect()
    .then(process)
    .catch((error) => {
        console.log(error);
    });
