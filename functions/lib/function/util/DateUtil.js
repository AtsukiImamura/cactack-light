"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.maxOf = exports.minOf = void 0;
const DateConfig_1 = require("../../function/model/date/DateConfig");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const JournalDate_1 = __importDefault(require("../../function/model/date/JournalDate"));
function minOf(d1, d2) {
    const dt1 = JournalDate_1.default.cast(d1);
    const dt2 = JournalDate_1.default.cast(d2);
    return dt1.beforeThan(dt2) ? dt1 : dt2;
}
exports.minOf = minOf;
function maxOf(d1, d2) {
    const dt1 = JournalDate_1.default.cast(d1);
    const dt2 = JournalDate_1.default.cast(d2);
    return dt1.afterThan(dt2) ? dt1 : dt2;
}
exports.maxOf = maxOf;
async function loadConfig(userId) {
    const userConfigMap = (await firebase_admin_1.default.firestore().collection("userConfig")
        .where("userId", "==", userId)
        .get()).docs.map(doc => doc.data()).reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
    }, {});
    return new DateConfig_1.DateConfig(userConfigMap);
}
exports.loadConfig = loadConfig;
