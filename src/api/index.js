'use strict';

var EventEmitter = require('events').EventEmitter;

var md5 = require('md5');
var _ = require('lodash');

var EventChain = require('./EventChain');
var RequestChain = require('./RequestChain');
var ResponseChain = require('./ResponseChain');
var BatchRequestChain = require('./BatchRequestChain');

var EmanClient = require('../client');

/**
 * @class
 *
 */
class EventApi {

    /**
     * @param  {log4js} logger
     * @param  {Object} config api config
     *  @return {EmanApi}
     */
    constructor(logger, config) {
        this._logger = logger;
        this._config = config;
        this._client = new EmanClient(logger, this._config.eman);
        this._name = this._client.getName();

        this._events = new EventEmitter();
    }


    /**
     * connecting to Eman
     *
     * @return {Promise}
     */
    connect() {
        return new Promise((resolve, reject) => {

            this._client.connect()
                .then(() => {

                    this._client.on('api:response', (event) => {
                        this._events.emit('response:' + event.request_id, event);
                    });

                    this._events.on('request', (event) => {
                        this._client.sendApiRequest(event);
                    });

                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });

        });
    }

    /**
     * disconnect from eman
     */
    disconnect() {
        this._client.disconnect();
    }

    /**
     * listen for event
     *
     * @param  {String}   event
     * @param  {Function} cb
     */
    on(event, cb) {
        this._client.emit('_service:api:request:subscribe', {name: event});
        this._client.on(event, cb);
    }

    /**
     *	init EventChain object
     *
     * @param  {String} name event name
     * @return {EventChain}
     */
    event(name) {
        return new EventChain(name, this);
    }

    /**
     * emit event (no response waiting)
     *
     * @param  {EventObject} event
     */
    emit(event) {
        var requestId = this._generateRequestId(event);
        event.request_id = requestId;

        this._events.emit('request', event);
        this._logger.trace('request => eman ', event);
    }

    /**
     * init RequestChain object
     *
     * @param  {String} name
     * @return {RequestChain}
     */
    request(name) {
        return new RequestChain(name, this);
    }

    /**
     * emit request event, wait for response event
     *
     * @param  {EventObject} event
     * @param  {Number} timeout in ms, default=500
     * @return {Promise}
     */
    sendRequest(event, timeout) {

        if (!timeout) {
            timeout = 500;
        }

        return new Promise((resolve, reject) => {

            var requestId = this._generateRequestId(event);

            event.request_id = requestId;

            var timeoutInstance;

            this._events.once('response:' + requestId, (event) => {
                clearTimeout(timeoutInstance);

                this._logger.trace('response <= eman ', event);

                if (event.error) {
                    reject(event.error);
                    return;
                }

                resolve(event.data);
            });

            timeoutInstance = setTimeout(() => {
               reject({message: 'Request Timeout', code: 'timeout', event: event});
           }, timeout);

            this._events.emit('request', event);
            this._logger.trace('request => eman ', event);
        });

    }

    /**
     * init ResponseChain object
     *
     * @param  {Object} event
     * @return {ResponseChain}
     */
    response(event) {
        return new ResponseChain(event, this);
    }

    /**
     * send Response event to Eman
     *
     * @param  {Object} event
     */
    sendResponse(event) {
        this._client.sendApiResponse(event);
    }

    /**
     * send and wait for response several request events
     *
     * @example
     * api.batchRequest()
     *    .request('messages.get').data({id:1}).add()
     *    .request('users.get').data({id: 1}).add()
     *    .send()
     *    .then(() => { ... })
     *    .catch(() => { ... });
     *
     * @return {BatchRequestChain}
     */
    batchRequest() {
        return new BatchRequestChain(this);
    }

    /**
     * get entity
     *
     * @return {String}
     */
    getEntity() {
        return (this._config.entity) ? this._config.entity : null;
    }

    /**
     * generate request id
     *
     * @private
     * @param  {EventObject} event
     * @return {String}
     */
    _generateRequestId(event) {
        var date = String(new Date().getTime());

        var requestId = this._name + ':' + event.name + ':' + date + ':' + md5(event.name + '-' + Math.random());

        return requestId;
    }

}

module.exports =EventApi;
