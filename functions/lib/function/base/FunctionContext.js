"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const ApiResponse_1 = __importDefault(require("./ApiResponse"));
var auth;
(function (auth) {
    class CallableFunction {
        constructor() {
            this._needAuth = false;
            this._filters = [];
        }
        static auth() {
            return new CallableFunction().auth();
        }
        static check(filter) {
            return new CallableFunction().check(filter);
        }
        static execute(exec) {
            return new CallableFunction().execute(exec);
        }
        get context() {
            return { token: this._token, params: this._req ? this._req.query : {} };
        }
        auth() {
            this._needAuth = true;
            return this;
        }
        async doAuth() {
            if (!this._needAuth) {
                return true;
            }
            if (!this._req || !this._res) {
                return false;
            }
            try {
                const token = await new AuthIdentifier(this._req).verify();
                if (!token.uid) {
                    throw new Error();
                }
                this._token = token;
                return true;
            }
            catch (e) {
                this._res
                    .status(200)
                    .json(new ApiResponse_1.default(403, "User authentication faild.", []).json());
            }
            return false;
        }
        check(filter) {
            this._filters.push(() => {
                const result = filter(this.context);
                if (typeof result === "boolean") {
                    return Promise.resolve().then(() => result);
                }
                else {
                    return result;
                }
            });
            return this;
        }
        execute(exec) {
            return async (req, res) => {
                res.set("Access-Control-Allow-Headers", "*" // Authorization, X-Requested-With, Origin, X-Csrftoken, Content-Type, Accept
                );
                res.set("Access-Control-Allow-Origin", "*"); // localhostを許可
                res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"); // DELETEだけは拒否
                if (req.method.toLowerCase() === "options") {
                    res.status(200).send();
                    return;
                }
                this._req = req;
                this._res = res;
                if (!(await this.doAuth())) {
                    return;
                }
                const checkErrors = (await Promise.all(this._filters.map((f) => f()))).filter((c) => !c);
                if (checkErrors.length > 0) {
                    res.status(200).json(new ApiResponse_1.default(400, "Check Error").json());
                    return;
                }
                try {
                    res.status(200).json(await exec(this.context)); // TODO: POSTに対応
                }
                catch (e) {
                    res
                        .status(200)
                        .json(new ApiResponse_1.default(400, "Internal Error", e).json());
                }
            };
        }
    }
    auth.CallableFunction = CallableFunction;
    class AuthIdentifier {
        constructor(req) {
            this._req = req;
        }
        get nakedIdToken() {
            if (!this._req.headers.authorization) {
                return "";
                // throw new Error('Authorization ヘッダが存在しません。')
            }
            const match = this._req.headers.authorization.match(/^Bearer (.*)$/);
            if (match) {
                const idToken = match[1];
                return idToken;
            }
            return "";
        }
        async verify() {
            const idToken = this.nakedIdToken;
            if (!idToken) {
                throw new TokenNotFoundError();
            }
            return await firebase_admin_1.default.auth().verifyIdToken(idToken);
        }
    }
    class TokenNotFoundError extends Error {
        constructor() {
            super("Token Not Found.");
        }
    }
    function authExecutable(onAuthenticated) {
        return async (req, res) => {
            res.set("Access-Control-Allow-Headers", "*" // Authorization, X-Requested-With, Origin, X-Csrftoken, Content-Type, Accept
            );
            res.set("Access-Control-Allow-Origin", "*"); // localhostを許可
            res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"); // DELETEだけは拒否
            if (req.method.toLowerCase() === "options") {
                res.status(200).send();
                return;
            }
            const token = getIdToken(req);
            if (!token) {
                res
                    .status(200)
                    .json(new ApiResponse_1.default(403, "No bearer token presents on the headers.", []).json());
                return;
            }
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
            if (!decodedToken.uid) {
                res
                    .status(200)
                    .json(new ApiResponse_1.default(403, "Can't resolve user id.", []).json());
                return;
            }
            try {
                res
                    .status(200)
                    .json(await onAuthenticated({ token: decodedToken, params: req.query })); // TODO: POSTに対応
            }
            catch (e) {
                res.status(200).json(new ApiResponse_1.default(400, "Internal Error", e).json());
            }
        };
    }
    auth.authExecutable = authExecutable;
    function getIdToken(request) {
        if (!request.headers.authorization) {
            return "";
            // throw new Error('Authorization ヘッダが存在しません。')
        }
        const match = request.headers.authorization.match(/^Bearer (.*)$/);
        if (match) {
            const idToken = match[1];
            return idToken;
        }
        return "";
    }
})(auth = exports.auth || (exports.auth = {}));
