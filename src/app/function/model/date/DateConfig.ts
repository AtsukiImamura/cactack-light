import { IDateConfig } from "../interface/date/IDateConfig";
import IJournalDate from "../interface/date/IJournalDate";
import JournalDate from "./JournalDate";

export class DateConfig implements IDateConfig{

    private _FIRST_DAY_OF_MONTH: number;

    private _ENABLE_MONTHLY_DISP: boolean;

    private _INCLUDE_FIRST_DAY_TO_NEXT_MONTH: boolean;


    constructor(config: {FIRST_DAY_OF_MONTH?: number, ENABLE_MONTHLY_DISP?: number, INCLUDE_FIRST_DAY_TO_NEXT_MONTH?: number}){
        this._FIRST_DAY_OF_MONTH = config.FIRST_DAY_OF_MONTH ? Number(config.FIRST_DAY_OF_MONTH) : 1
        this._ENABLE_MONTHLY_DISP = config.ENABLE_MONTHLY_DISP ? config.ENABLE_MONTHLY_DISP > 0 : false
        this._INCLUDE_FIRST_DAY_TO_NEXT_MONTH = config.INCLUDE_FIRST_DAY_TO_NEXT_MONTH ? config.INCLUDE_FIRST_DAY_TO_NEXT_MONTH > 0 : false
    }

    public get FIRST_DAY_OF_MONTH(): number {
        return this._FIRST_DAY_OF_MONTH;
    }

    public get ENABLE_MONTHLY_DISP(): boolean {
        return this._ENABLE_MONTHLY_DISP;
    }

    public get INCLUDE_FIRST_DAY_TO_NEXT_MONTH(): boolean {
        return this._INCLUDE_FIRST_DAY_TO_NEXT_MONTH;
    }

    public getMonthOf(date: IJournalDate){
        if(this.ENABLE_MONTHLY_DISP){
            if(this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH){
                if(date.day >= this.FIRST_DAY_OF_MONTH){
                    return (date.month % 12) + 1
                }else {
                    return date.month
                }
            }else {
                return date.month
            }
        }else {
            return date.month
        }
    }

    public getYearOf(date: IJournalDate){
        if(this.ENABLE_MONTHLY_DISP){
            if(this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH){
                if(date.day >= this.FIRST_DAY_OF_MONTH){
                    return date.year +  Math.floor(date.month / 12)  // 12月の場合だけ1年追加
                }else {
                    return date.year
                }
            }else {
                return date.year
            }
        }else {
            return date.year
        }
    }

    public lastDayOf(year: number, month: number): IJournalDate {
        if(this.FIRST_DAY_OF_MONTH === 1){
            return JournalDate.byDay(year, month, 1).getNextMonth().getPreviousDay()     
        }
        if(this.ENABLE_MONTHLY_DISP){
            if(this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH){
                return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH - 1)
            }else {
                return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH - 1).getNextMonth()
            }
        }else {                
            return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH - 1).getNextMonth()
        }
    }

    public firstDayOf(year: number, month: number): IJournalDate {
        if(this.FIRST_DAY_OF_MONTH === 1){
            return JournalDate.byDay(year, month, 1)
        }
        if(this.ENABLE_MONTHLY_DISP){
            if(this.INCLUDE_FIRST_DAY_TO_NEXT_MONTH){
                return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH).getPreviousMonth()
            }else {
                return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH)
            }
        }else {                
            return JournalDate.byDay(year,month, this.FIRST_DAY_OF_MONTH)
        }
    }
}