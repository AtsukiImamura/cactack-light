"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalData = void 0;
// import { DJournal } from "../../function/base/interface/DJournal";
const ApiResponse_1 = __importDefault(require("../base/ApiResponse"));
const JournalDate_1 = __importDefault(require("../../common/model/date/JournalDate"));
const DataStore_1 = require("../../function/base/DataStore");
var JournalData;
(function (JournalData) {
    async function getBookContext(context) {
        if (!context.token) {
            throw new Error("authentication context was not given.");
        }
        const periodFrom = JournalDate_1.default.cast(context.params.from);
        // const periodTo = JournalDate.cast(context.params.to);
        const journals = await new DataStore_1.DataStore("journals").getByKey("userId", context.token.uid);
        return new ApiResponse_1.default(200, "", {
            date: periodFrom.toString(),
            journals: journals
        }).json();
    }
    JournalData.getBookContext = getBookContext;
})(JournalData = exports.JournalData || (exports.JournalData = {}));
