'use strict';

var _ = require('lodash');

var ErrorResponseChain = require('./ErrorResponseChain');

/**
 * @class
 * @example
 *
 * eventApi.on('messages.post', (event) => {
 *     eventApi.response(event).data({result: true}).send();
 *     // OR if error
 *     eventApi.response(event).error('no such company', 'not_found').status(404).send();
 * });
 *
 */
class ResponseChain {

    /**
     * @param  {String} name
     * @param  {EventApi} eventApi
     */
    constructor(event, eventApi) {
        this._event = _.cloneDeep(event);

        this._event.data = {};

        this._eventApi = eventApi;
    }

    /**
     * init ErrorResponseChain
     *
     * @param  {String} message
     * @param  {String} code
     * @return {ErrorResponseChain}
     */
    error(message, code) {
        return new ErrorResponseChain(
            this._event, this._eventApi,
            message, code, this._eventApi.getEntity()
        );
    }

    /**
     * set event data
     *
     * @param  {Object} data
     * @return {this}
     */
    data(data) {
        this._event.data = data;
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
        return this._eventApi.sendResponse(this._event);
    }

}

module.exports = ResponseChain;
