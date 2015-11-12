'use strict';

var _ = require('lodash');


/**
 * @class
 */
class ErrorResponseChain {

    /**
     * @param  {EventObject} event
     * @param  {EmanApi} eventApi
     * @param  {String} message
     * @param  {String} code
     */
    constructor(event, eventApi, message,  code, entity) {

        this._event = _.cloneDeep(event);

        delete this._event.data;

        this._event.error = {
            message: (message) ? message: null,
            code: (code) ? code : null,
            entity: (entity) ? entity : null,
            status: null,
            list: null
        };

        this._eventApi = eventApi;
    }

    /**
     * set error status code (http-code)
     * @param  {Number} status http code
     * @return {this}
     */
    status(status) {
        this._event.error.status = status;
        return this;
    }

    /**
     * set human list of errors
     *
     * @param  {Array} errorList
     * @return {this}
     */
    list(errorList) {
        this._event.error.list = errorList;
        return this;
    }

    /**
     * set entity
     *
     * @param  {String} entity
     * @return {this}
     */
    entity(entity) {
        this._event.error.entity = entity;
        return this;
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


module.exports = ErrorResponseChain;
