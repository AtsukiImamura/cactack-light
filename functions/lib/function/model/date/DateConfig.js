"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateConfig = void 0;
const JournalDate_1 = __importDefault(require("./JournalDate"));
class DateConfig {
    constructor(config) {
        this._FIRST_DAY_OF_MONTH = config.FIRST_DAY_OF_MONTH ? Number(config.FIRST_DAY_OF_MONTH) : 1;
        this._ENABLE_MONTHLY_DISP = config.ENABLE_MONTHLY_DISP ? config.ENABLE_MONTHLY_DISP > 0 : false;
        this._INCLUDE_FIRST_DAY_TO_NEXT_MONTH = config.INCLUDE_FIRST_DAY_TO_NEXT_MONTH ? config.INCLUDE_FIRST_DAY_TO_NEXT_MONTH > 0 : false;
    }
    get FIRST_DAY_OF_MONTH() {
        return this._FIRST_DAY_OF_MONTH;
    }
    get ENABLE_MONTHLY_DISP() {
        return this._ENABLE_MONTHLY_DISP;
    }
    get INCLUDE_FIRST_DAY_TO_NEXT_MONTH() {
        return this._INCLUDE_FIRST_DAY_TO_NEXT_MONTH;
    }
    getMonthOf(date) {
        if (this.ENABLE_MONTHLY_DISP) {
            if (this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH) {
                if (date.day >= this.FIRST_DAY_OF_MONTH) {
                    return (date.month % 12) + 1;
                }
                else {
                    return date.month;
                }
            }
            else {
                return date.month;
            }
        }
        else {
            return date.month;
        }
    }
    getYearOf(date) {
        if (this.ENABLE_MONTHLY_DISP) {
            if (this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH) {
                if (date.day >= this.FIRST_DAY_OF_MONTH) {
                    return date.year + Math.floor(date.month / 12); // 12月の場合だけ1年追加
                }
                else {
                    return date.year;
                }
            }
            else {
                return date.year;
            }
        }
        else {
            return date.year;
        }
    }
    lastDayOf(year, month) {
        if (this.FIRST_DAY_OF_MONTH === 1) {
            return JournalDate_1.default.byDay(year, month, 1).getNextMonth().getPreviousDay();
        }
        if (this.ENABLE_MONTHLY_DISP) {
            if (this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH) {
                return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH - 1);
            }
            else {
                return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH - 1).getNextMonth();
            }
        }
        else {
            return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH - 1).getNextMonth();
        }
    }
    firstDayOf(year, month) {
        if (this.FIRST_DAY_OF_MONTH === 1) {
            return JournalDate_1.default.byDay(year, month, 1);
        }
        if (this.ENABLE_MONTHLY_DISP) {
            if (this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH) {
                return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH).getPreviousMonth();
            }
            else {
                return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH);
            }
        }
        else {
            return JournalDate_1.default.byDay(year, month, this.FIRST_DAY_OF_MONTH);
        }
    }
}
exports.DateConfig = DateConfig;
