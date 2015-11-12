'use strict';

/**
 * @class
 * @example
 * eventApi.event('messages.post')
 *         .data({
 *             message: 'test'
 *          })
 *         .emit();
 */
class EventChain {

    /**
     * @param  {String} name
     * @param  {EventApi} eventApi
     */
    constructor(name, eventApi) {
        this._event = {
            name: name
        };

        this._timeout = 500;

        this._eventApi = eventApi;
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
    emit() {
        return this._eventApi.emit(this._event);
    }

}

module.exports = EventChain;
