'use strict';

/**
 * @class
 * @example
 * eventApi.request('messages.post')
 *         .data({
 *             message: 'test'
 *          })
 *         .timeout(300)
 *         .send()
 *         .then((responseEvent) => {
 *             // ...
 *         })
 *         .catch((error) => {
 *             // ...
 *         })
 */
class RequestChain {

    /**
     * @param  {String} name
     * @param  {EventApi} eventApi
     */
    constructor(name, eventApi, batchRequestChain) {
        this._event = {
            name: name
        };

        this._timeout = null;

        this._eventApi = null;
        this._batchRequestChain = null;

        if (eventApi) {
            this._eventApi = eventApi;
        }

        if (batchRequestChain) {
            this._batchRequestChain = batchRequestChain;
        }
    }

    /**
     * set event data
     * @param  {Object} data
     * @return {this}
     */
    data(data) {
        this._event.data = data;
        return this;
    }

    /**
     * set timeout for event response
     *
     * @param  {Number} timeout in ms
     * @return {this}
     */
    timeout(timeout) {
        this._timeout = timeout;
        return this;
    }

    /**
     * get event object
     *
     * @return {EventObject}
     */
    get() {
        return this._event;
    }

    /**
     * emit event to Eman
     *
     * @return {Promise}
     */
    send() {
        if (this._batchRequestChain) {
            throw new Error('RequestChain created in batch mode use add method');
        }

        return this._send();
    }

    /**
     * @private
     *
     * @return {Promise}
     */
    _send() {
        return this._eventApi.sendRequest(this._event, this._timeout)
    }

    /**
     * using only in batchRequest
     */
    add() {
        if (this._batchRequestChain) {
            this._batchRequestChain.add(this._send());
            return this._batchRequestChain;
        } else {
            throw new Error('RequestChain not in BatchRequestChain, dont use method "add"');
        }
    }

}

module.exports = RequestChain;
