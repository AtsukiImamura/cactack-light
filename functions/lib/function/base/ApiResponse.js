"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(code = 200, message = "", data = {}) {
        this._code = code;
        this._message = message;
        this._data = data;
    }
    json() {
        return {
            code: this._code,
            message: this._message,
            data: this._data,
        };
    }
}
exports.default = ApiResponse;
