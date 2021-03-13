"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOfWeek = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
var localeData = require("dayjs/plugin/localeData");
dayjs_1.default.extend(localeData);
require("dayjs/locale/ja");
dayjs_1.default.locale("ja");
class JournalDate {
    constructor(val) {
        if (typeof val !== "string") {
            this.date = dayjs_1.default(val);
            return;
        }
        let date = JournalDate.parse(val);
        if (!date.date()) {
            date = dayjs_1.default(val
                .split("/")
                .slice(0, -1)
                .join("/"), "YYYY/M").endOf("month");
        }
        if (!date.isValid()) {
            throw new Error("Something has gone wrong with given date string. " + date);
        }
        this.date = date;
    }
    static cast(value) {
        return typeof value === "string" ? JournalDate.fromToken(value) : value;
    }
    /**
     * 今日の値を持つ日付クラスを作成する
     */
    static today() {
        return new JournalDate(new Date());
    }
    /**
     * Dateクラスから作成する
     * @param {Date} date
     */
    static byDate(date) {
        return new JournalDate(date);
    }
    static byDayOfWeek(day, date) {
        return new JournalDate((date ? dayjs_1.default(date) : dayjs_1.default()).day(day));
    }
    /**
     * 年月日を指定して日付クラスを生成する
     * @param year
     * @param month
     * @param day
     */
    static byDay(year, month, day) {
        return new JournalDate(new Date(Number(year), Number(month) - 1, Number(day)));
    }
    static byMonth(year, month) {
        return new JournalDate(`${year}/${month}/1`);
    }
    static lastDayOf(year, month) {
        return JournalDate.byDay(year, month, 32);
    }
    static fromToken(token) {
        return new JournalDate(token);
    }
    static min(d1, d2) {
        return d1.beforeThan(d2) ? d1 : d2;
    }
    static max(d1, d2) {
        return d1.afterThan(d2) ? d1 : d2;
    }
    static parse(token) {
        return dayjs_1.default(token, "YYYY/M/D");
    }
    get year() {
        return this.date.year();
    }
    get month() {
        return this.date.month() + 1;
    }
    /**
     * Returns the day part of the date if it is defined, else returns negative value.
     * Note that day begins with 1.
     */
    get day() {
        return this.date.date();
    }
    get dayName() {
        return dayjs_1.default.weekdays()[this.date.day()];
    }
    get firstDay() {
        return new JournalDate(this.date.startOf("month"));
    }
    get lastDay() {
        return new JournalDate(this.date.endOf("month"));
    }
    beforeThan(date) {
        return this.date.isBefore(dayjs_1.default(date.toDate()));
    }
    beforeThanOrEqualsTo(date) {
        return this.equalsTo(date) || this.beforeThan(date);
    }
    equalsTo(date) {
        return this.date.diff(dayjs_1.default(date.toDate()), "day") === 0;
    }
    afterThan(date) {
        return this.date.diff(dayjs_1.default(date.toDate()), "day") > 0;
    }
    afterThanOrEqualsTo(date) {
        return !this.beforeThan(date);
    }
    toString() {
        return `${this.year}/${this.month < 10 ? "0" : ""}${this.month}${this.day > 0 ? `/${this.day < 10 ? "0" : ""}${this.day}` : ""}`;
    }
    format(format) {
        return this.date.format(format);
    }
    toDate() {
        return new Date(this.year, this.month - 1, this.day > 0 ? this.day : 1);
    }
    getNextWeek() {
        return new JournalDate(this.date.add(1, "week"));
    }
    getPreviousWeek() {
        return new JournalDate(this.date.subtract(1, "week"));
    }
    getNextMonth() {
        return this.getAfterMonthOf(1);
    }
    getNextDay() {
        return new JournalDate(this.date.add(1, "day"));
    }
    getPreviousDay() {
        return new JournalDate(this.date.subtract(1, "day"));
    }
    getAfterMonthOf(val) {
        return new JournalDate(this.date.add(val, "month"));
    }
    isInMonthOf(date) {
        return date.year === this.year && date.month === this.month;
    }
    isInYearOf(date) {
        return date.year === this.year;
    }
    getMonthsOfAfter(num) {
        const months = [this];
        for (let i = 0; i < num; i++) {
            months.push(this.getAfterMonthOf(i + 1));
        }
        return months;
    }
    getPreviousMonth() {
        return this.getBeforeMonthOf(1);
    }
    getPreviousYear() {
        return new JournalDate(this.date.subtract(1, "year").toDate());
    }
    getBeforeMonthOf(val) {
        return new JournalDate(this.date.subtract(val, "month").toDate());
    }
    setDate(date) {
        this.date = dayjs_1.default(date);
        return this;
    }
    countDayFrom(date) {
        return JournalDate.countDayBetween(date, this);
    }
    static countDayBetween(from, to) {
        return Math.abs(dayjs_1.default(from.toDate()).diff(dayjs_1.default(to.toDate()), "day")) + 1;
    }
}
exports.default = JournalDate;
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["SUNDAY"] = 0] = "SUNDAY";
    DayOfWeek[DayOfWeek["MONDAY"] = 1] = "MONDAY";
    DayOfWeek[DayOfWeek["TUESDAY"] = 2] = "TUESDAY";
    DayOfWeek[DayOfWeek["WEDNESDAY"] = 3] = "WEDNESDAY";
    DayOfWeek[DayOfWeek["THIRSDAY"] = 4] = "THIRSDAY";
    DayOfWeek[DayOfWeek["FRYDAY"] = 5] = "FRYDAY";
    DayOfWeek[DayOfWeek["SATURDAY"] = 6] = "SATURDAY";
})(DayOfWeek = exports.DayOfWeek || (exports.DayOfWeek = {}));
