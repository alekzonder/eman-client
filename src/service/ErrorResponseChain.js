'use strict';

class ErrorResponseChain {

    constructor(res, message, code) {

        this._res = res;

        this._res.event.error = {
            entity: this._res.getEntity(),
            message: message,
            code: code
        };

    }

    status(status) {
        this._res.event.error.status = status;
        return this;
    }

    entity(entity) {
        this._res.event.error.entity = entity;
    }

    list(list) {
        this._res.event.error.list = list;
        return this;
    }

    emit() {
        this._res.emit();
    }

}

module.exports = ErrorResponseChain;
