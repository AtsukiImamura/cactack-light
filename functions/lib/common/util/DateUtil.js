"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxOf = exports.minOf = void 0;
const JournalDate_1 = __importDefault(require("../model/date/JournalDate"));
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
