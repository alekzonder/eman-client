"use strict";

var uuid = require('uuid');
var _ = require('lodash');
var joi = require('joi');

var EventApi = require('./EventApi');

var ResponseChain = require('./ResponseChain');
var ErrorResponseChain = require('./ErrorResponseChain');

class EmanService {

    constructor(logger, eventman, config) {
        this._logger = logger;
        this._config = config;

        this._entity = 'undefined';

        this._eventman = eventman;

        this._initEventman();

        this._events = new EventApi(this._logger, {}, this._eventman);
    }

    on(event, cb) {
        this._eventman.on(event, cb);
    }

    res(event) {
        return new ResponseChain(this._eventman, event, this._entity);
    }

    response(event) {
        this._eventman.apiResponse(event);
    }

    generateUniqId() {
        return uuid.v4();
    }

    getEventApi() {
        return this._events;
    }

    validate(data, schema) {

        return new Promise((resolve, reject) => {

            joi.validate(data, schema, {convert:true, abortEarly: false}, (err, value) => {

                if (err) {
                    var error = {
                        message: 'Invalid request',
                        code: 'invalid_request',
                        status: 400,
                        list: []
                    };

                    _.each(err.details, (d) => {
                        error.list.push({
                            message: d.message,
                            path: d.path
                        });
                    });

                    reject(error);
                    return;
                }

                resolve(value);
            });

        });

    }

    _initEventman() {

        this._eventman.on('connect', () => {
            this._logger.debug('connected to eventman ' + this._config.eventman.url);
        });

        this._eventman.on('disconnect', () => {
            this._logger.info('disconnected from eventman ' + this._config.eventman.url);
        });

        this._eventman.on('err', (error) => {
            this._logger.error(error);
        });

        this._eventman.on('online', (data) => {
            this._logger.debug('online in room ' + data.room);
        });

        this._eventman.on('who', (data) => {
            this._logger.debug('who');
            this._eventman.emit('iam', this._config.eventman.iam);
        });
    }

}


module.exports = EmanService;
