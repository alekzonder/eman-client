"use strict";

var socketIo = require('socket.io-client');
var EventEmitter = require('events').EventEmitter;

/**
 * @class
 */
class EmanClient {

    /**
     * @param  {log4js} logger
     * @param  {Object} config client config
     * @return {EmanClient} 
     */
    constructor(logger, config) {
        this._logger = logger;
        this._config = config;

        this._io = null;

        this._id = null;

        // TODO need Emitter here?
        this.events = new EventEmitter();
    }

    /**
     * name of service
     * @return {String}
     */
    getName() {
        return this._config.i_am.name;
    }

    /**
     * ID issued by Eman
     * @return {String}
     */
    getId() {
        return this._id;
    }

    /**
     * connect to Eman
     * @return {Promise}
     */
    connect() {
        return this._handshake();
    }

    /**
     * disconnect from Eman
     */
    disconnect() {
        this._io.disconnect();
    }

    /**
     * handshake
     * @private
     * @return {Promise}
     */
    _handshake() {

        return new Promise((resolve, reject) => {

            var startHandshakeTime = new Date().getTime();

            this._io = socketIo.connect(this._config.url);

            this._io.on('shake_who', () => {
                this._logger.trace(`eman => shake_who`);
                this._logger.trace(`eman <= shake_i_am`, this._config.i_am);
                this._io.emit('shake_i_am', this._config.i_am);
            });

            this._io.on('shake_id', (data) => {

                this._logger.trace(`eman => shake_id`, data);

                this._id = data.id;

                this._logger.debug('service got id = ' + this._id);

                this._logger.trace(`eman <= shake_ready`, {id: this._id});

                this._io.emit('shake_ready', {id: this._id});
            });

            this._io.on('shake_error', (data) => {
                this._logger.trace(`eman => shake_error`, data);
                reject(data);
            });

            this._io.on('shake_online', () => {
                this._logger.trace(`eman <= shake_online`);
                this._logger.info('service "' + this.getName() + '" with id "' + this.getId() + '" online');

                this.events.emit('online');

                var endHandshakeTime = new Date().getTime();
                this._logger.debug('handshake done in ' + (endHandshakeTime - startHandshakeTime) + ' ms');

                resolve();
            });

        });
    }

    /**
     * listen event from Eman
     *
     * @param  {String}   event
     * @param  {Function} cb
     */
    on(event, cb) {
        this._logger.trace(`eman ...= "${event}"`);
        this._io.on(event, cb);
    }

    /**
     * Emit event to Eman
     *
     * @param  {String} name
     * @param  {Object} event
     */
    emit(name, event) {
        this._logger.trace(`eman => "${name}"`, event);
        this._io.emit(name, event);
    }

    /**
     * send event ApiRequest to Eman
     *
     * @param  {EventObject} event
     */
    sendApiRequest(event) {
        event.sender_id = this._id;
        this.emit('api:request', event);
    }

    /**
     * send event apiResponse to Eman
     *
     * @param  {EventObject} event
     */
    sendApiResponse(event) {
        event.recipient_id = this._id;

        this.emit('api:response', event);
    }

}

module.exports = EmanClient;
