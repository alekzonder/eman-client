var EmanApi = require('../Api');

var logger = require('log4js').getLogger('[client-usage]');
// logger.setLevel('DEBUG');

var config = {
    // what entity type your service process, need for errors
    // esspecially for batch request errors
    entity: 'messages',
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

    api.request('messages.post')
       .data({message: 'test2'}).timeout(300)
       .send()
       .then((data) => {
           logger.info('got response', data);
       })
       .catch((err) => {
           logger.error(err);
       });


     api.on('companies.get', (event) => {
         api.response(event).data({from: 'companies', result: event.data}).send();
     });

     // test error response
     api.on('messages.test-error', (event) => {

         api.response(event)
            .error(`Message id = "${event.data.id}" not found`, 'not_found')
            .status(404)
            .list([
                `Message  id = ${event.data.id} not found`
            ])
            .send();

     });

     // making batch requests
     api.batchRequest()
         .request('messages.post').data({id: 1}).timeout(300).add()
         .request('companies.get').data({id: 100}).timeout(100).add()
         .send()
         .then((batch) => {
             logger.info(batch);

             return;
         })
         .then(() => {

             // test error response
             api.request('messages.test-error')
             .data({id: 100})
             .send()
             .then((data) => {
                 logger.info(data);
             })
             .catch((error) => {
                 logger.error(error);
                 api.disconnect();
             })

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
