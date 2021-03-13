"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateUtil = __importStar(require("../../../function/util/DateUtil"));
const JournalDate_1 = __importDefault(require("../../model/date/JournalDate"));
class UpdateManagerBase {
    constructor(after, before) {
        this.targets = [];
        this.after = after;
        this.before = before;
        this.initiationTask = DateUtil.loadConfig(this.after.userId).then(config => this.config = config);
    }
    get minDateInfo() {
        return this.createDateInfo(this.minDate);
    }
    get dateInfoOfAfter() {
        return this.createDateInfo(this.after.accountAt);
    }
    createDateInfo(date) {
        const year = this.config.getYearOf(JournalDate_1.default.cast(date));
        const month = this.config.getMonthOf(JournalDate_1.default.cast(date));
        return { year: year, month: month, key: `${year}.${month < 10 ? "0" : ""}${month}` };
    }
    get minDate() {
        if (!this.before) {
            return this.after.accountAt;
        }
        return this.after.accountAt < this.before.accountAt ? this.after.accountAt : this.before.accountAt;
    }
    /**
     * 与えられた仕訳に基づいて更新を行う
     */
    async execute() {
        await this.initiationTask; // configのロードが終わるのを待つ
        await this.loadTargets();
        if (this.before) {
            await this.update(this.before, false);
        }
        {
            await this.update(this.after, true);
        }
        await this.commit();
        return this.targets;
    }
}
exports.default = UpdateManagerBase;
