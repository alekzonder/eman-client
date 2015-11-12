'use strict';

class ResponseChain {

    constructor(eventman, event, entity) {
        this._eventman = eventman;

        this._entity = entity;

        this.event = {
            name: event.name,
            request_id: event.request_id,
            sender_id: event.sender_id
        };
    }

    error(message, code) {
        return new ErrorResponseChain(this, message, code);
    }

    data(data) {
        this.event.data = data;
        return this;
    }

    getEntity() {
        return this._entity;
    }

    emit() {
        this._eventman.apiResponse(this.event);
    }
}

module.exports = ResponseChain;
