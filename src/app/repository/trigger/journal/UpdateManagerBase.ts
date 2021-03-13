import { DJournal } from "@/app/model/interface/DJournal"
import * as UserDateUtil from "@/app/model/common/UserDateUtil"
import JournalDate from "@/app/model/common/JournalDate"
import { DateConfig } from "@/app/function/model/date/DateConfig"

export default abstract class UpdateManagerBase<T> {
    /** 変更前イメージ。ない場合は「追加」の意味 */
    protected before: DJournal | undefined
    /** 更新後イメージ */
    protected after: DJournal

    protected targets: T[] = []

    protected config!: DateConfig;

    
    protected get minDateInfo() {
        return this.createDateInfo(this.minDate)
    }
    protected get dateInfoOfAfter() {
        return  this.createDateInfo(this.after.accountAt)
    }

    protected createDateInfo(date: string) {
        const year = this.config.getYearOf(JournalDate.cast(date))
        const month = this.config.getMonthOf(JournalDate.cast(date))
        return {year: year, month: month, key:`${year}.${month < 10 ? "0" : ""}${month}`}
    }

    private initiationTask: Promise<any>;

        
    protected get minDate(): string {
        if(!this.before){
            return this.after.accountAt
        }
        return this.after.accountAt < this.before.accountAt ? this.after.accountAt: this.before.accountAt
    }


    constructor(after: DJournal,before?: DJournal){
        this.after = after
        this.before = before
        this.initiationTask = UserDateUtil.loadConfig(this.after.userId).then(config => this.config = config)
    }


    protected abstract loadTargets(): Promise<void>;

    protected abstract update(journal: DJournal, acc: boolean): Promise<void>;

    protected abstract commit(): Promise<void>;
        
    /**
     * 与えられた仕訳に基づいて更新を行う
     */
    public async execute(): Promise<T[]> {
        await this.initiationTask // configのロードが終わるのを待つ
        await this.loadTargets()
        if(this.before){
            await this.update(this.before, false)
        }
        {
            await this.update(this.after, true)
        }
        await this.commit()
        return this.targets
    }
}

