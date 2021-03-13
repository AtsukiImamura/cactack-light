import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import admin from "firebase-admin";
import DHistory from "@/app/model/interface/DHistory";
import UpdateManagerBase from "./UpdateManagerBase";

/**
 * 履歴の更新管理
 */
export default class HistoryUpdateManager extends UpdateManagerBase<DHistory>{

    private get relatedItemIds(): string[] {
        const itemIds: string[] = [...this.after.credits, ...this.after.debits].map(d => d.categoryItemId)
        if(this.before) {
            itemIds.push(...this.before.credits.map(d => d.categoryItemId))
            itemIds.push(...this.before.debits.map(d => d.categoryItemId))
        }
        return Array.from(itemIds)
    }

    private get historyMap() {
        return this.targets.reduce((map, hist) => {
            if(!map.has(hist.itemId)){
                map.set(hist.itemId, [])
            }
            map.get(hist.itemId)!.push(hist)
            return map
        }, new Map<string, DHistory[]>() )
    }

    /**
     * 更新対象となる履歴を読み込む
     * 対象としている仕訳分の履歴がない場合は追加してから読み込む
     */
    protected async loadTargets() {
        const histories: DHistory[] = []
        let itemCnt = 0
        while(true) {
            const itemIds = this.relatedItemIds.slice(itemCnt,(itemCnt += 10) - 1)
            if(itemIds.length === 0){
                break
            }
            histories.push(...await this.loadHistoriesByItemIds(itemIds))
        }
        // 対象仕訳分の履歴がなければ追加
        if(histories.filter(h => h.date === this.after.accountAt).length === 0){
            const histIds =  await this.createHistoryOfAfterJournal()
            histories.push(...await Promise.all(
                histIds.map(async id => 
                    admin.firestore().collection("history")
                                        .doc(id)
                                        .get()
                                        .then(
                                            doc => {const hist = doc.data() as DHistory; hist.id = doc.id;return hist})
                                        )
                )
            )
        }
        this.targets = histories
    }

    /**
     * 扱っている仕訳のユーザで、更新対象となる、指定された仕訳項目の履歴を読み込む
     * @param itemIds 
     */
    private async loadHistoriesByItemIds(itemIds: string[]) {
        // firestoreの仕様に合わせる
        if(itemIds.length > 10){
            throw new Error("length of itemIds must not be greater than 10.")
        }
        return (await admin.firestore().collection("history")
            .where("userId", "==", this.after.userId)
            .where("itemId", "in", Array.from(itemIds)) // itemDiffMapには関係するすべての仕訳項目が入っている
            .where("date", ">=", this.minDate)
            .get()).docs.map(doc => {
                const hist = doc.data()
                hist.id = doc.id
                return hist as DHistory
            })
    }

    /**
     * 保持する履歴を更新する
     * @param journal 
     * @param acc 更新モード（true:増分、 false:差分）
     */
    protected async update(journal: DJournal, acc: boolean = true) {
        const updateDetails = (details: DJournalDetail[], acc: boolean = true) => {
            for(const dtl of details){
                const itemId = dtl.categoryItemId
                if(!this.historyMap.has(itemId)){
                    continue
                }
                const histories = this.historyMap.get(itemId)!
                for(const hist of histories){
                    // 自分よりも前の履歴に更新を入れない
                    if(hist.date < journal.accountAt){
                        continue
                    }
                    const diff = (acc ? 1 : -1) * dtl.amount
                    hist.amount += diff
                    // 当日なら差分も更新する
                    if(hist.date === journal.accountAt){
                        hist.diff += diff
                    }
                }
            }
        }
        updateDetails(journal.credits, acc)
        updateDetails(journal.debits, !acc)
    }

    /**
     * 保持する履歴をすべて確定させる
     */
    protected async commit() {
        await Promise.all(this.targets.map(hist => admin.firestore().collection("history").doc(hist.id).update(hist)))
    }

    /**
     * 今回対象の仕訳の日付の履歴を作成する
     */
    private async createHistoryOfAfterJournal() {
        const addNewHistories = (details: DJournalDetail[]) => {
            const tasks: Promise<string>[] = []
            for(const dtl of details){
                tasks.push((async () => {
                    const latestHistories = (await admin.firestore().collection("history")
                        .where("userId", "==", this.after.userId)
                        .where("itemId", "==", dtl.categoryItemId)
                        .where("date", "<", this.after.accountAt)
                        .orderBy("date", "desc")
                        .limit(1)
                        .get())
                    const baseAmount = latestHistories.docs.length === 0 ? 0 : latestHistories.docs[0].data().amount
                    const hist = {
                        itemId: dtl.categoryItemId,
                        amount: baseAmount,
                        diff: 0,
                        date: this.after.accountAt,
                        userId: this.after.userId  
                    }
                    return admin.firestore().collection("history")
                        .add(hist).then(ref => ref.id)
                })()) 
            }
            return tasks
        }
        const addTasks: Promise<string>[] = []
        addTasks.push(...addNewHistories(this.after.credits))
        addTasks.push(...addNewHistories(this.after.debits))
        return await Promise.all(addTasks)
    }
}