'use strict';

var RequestChain = require('./RequestChain');

/**
 * @class
 * @example
 * api.batchRequest()
 *    .request('companies.get').data({id: 1}).add()
 *    .request('projects.get').data({id: 2}).add()
 *    .send()
 *    .then((data) => {
 *        // data[0] - response for companies.get
 *        // data[1] - response for projects.get
 *    })
 *    .catch((error) => {
 *        // ...
 *    })
 *
 */
class BatchRequestChain {

    /**
     * @param  {String} name
     * @param  {EventApi} eventApi
     */
    constructor(eventApi) {
        this._eventApi = eventApi;

        this._promises = [];
    }

    /**
     * init RequestChain
     *
     * @param  {String} name
     * @return {RequestChain}
     */
    request(name) {
        return new RequestChain(name, this._eventApi, this);
    }

    /**
     * add promise in batch
     *
     * @param {Promise} sendPromise
     */
    add(sendPromise) {
        this._promises.push(sendPromise);
        return this;
    }

    /**
     * emit events to Eman
     *
     * @return {Promise}
     */
    send() {
        return Promise.all(this._promises);
    }

}

module.exports = BatchRequestChain;
