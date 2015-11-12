'use strict';

var _ = require('lodash');

/**
 * @class
 * @example
 *
 * eventApi.on('messages.post', (event) => {
 *     eventApi.response(event).data({result: true}).send();
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

        this._eventApi = eventApi;
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
