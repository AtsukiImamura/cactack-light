import DBalance from "@/app/model/interface/DBalance";
import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import UpdateManagerBase from "./UpdateManagerBase";
import admin from "firebase-admin";

export default class BalanceUpdateManager extends UpdateManagerBase<DBalance>{

    protected async loadTargets() {
        const minDateKeyInfo = this.minDateInfo
        const dateKeyInfo = this.dateInfoOfAfter
        const balances = (await admin.firestore().collection("balance")
                    .where("userId", "==", this.after.userId)
                    .where("dateKey", ">=", minDateKeyInfo.key)
                    .get()
                ).docs
                .map(doc => {
                    const bls = doc.data() as DBalance
                    bls.id = doc.id
                    return bls
                })
        if(!balances.map(b => b.dateKey).includes(dateKeyInfo.key)){
            balances.push(await this.createNewBalance(dateKeyInfo))
        }
        this.targets = balances
    }

    private async createNewBalance(dateKeyInfo: {year: number, month: number, key: string}) {
        const pastBalances = (await admin.firestore().collection("balance")    
            .where("userId", "==", this.after.userId)
            .where("dateKey", "<", dateKeyInfo.key)
            .orderBy("dateKey", "desc")
            .limit(1)
            .get()
        ).docs
        .map(doc => {
            const bls = doc.data() as DBalance
            bls.id = doc.id
            return bls
        })
        const targetBalance = pastBalances.length === 0 ? {year: dateKeyInfo.year, month: dateKeyInfo.month, dateKey: dateKeyInfo.key, data: {}, userId: this.after.userId} as DBalance: pastBalances[0]

        // MEMO: 履歴があるのに当月分の貸借対照表がないのは、当月分貸借対照表がない月の仕訳の新規作成かつ履歴が更新された直後に限られる
        //        => その場合はこの後のupdate()で更新されるので過去の履歴からの累積引継ぎは不要



        // // 過去の履歴の中から直近のものを足す
        // const histories = (await (await (async () => {
        //     const dateConfig = await DateUtil.loadConfig(this.after.userId)
        //     const ql = admin.firestore().collection("history")
        //         .where("userId", "==", this.after.userId)
        //         .where("date", "<=", (dateConfig.lastDayOf(dateKeyInfo.year, dateKeyInfo.month).toString()))
        //     if(targetBalance.year){
        //         return ql.where("date", ">", dateConfig.lastDayOf(targetBalance.year, targetBalance.month).toString())
        //     }else {
        //         return ql
        //     }
        // })()).get()).docs.map(doc => {
        //     const hist = doc.data()
        //     hist.id = doc.id
        //     return hist as DHistory
        // }).sort((a,b) => a.date < b.date ? 1:-1)

        // const itemIds = Array.from(new Set(histories.map(h => h.itemId))) // 項目IDの重複をなくす

        // for(const itemId of itemIds){
        //     // 直近の表にない場合はまず0とする
        //     if(!targetBalance.data[itemId]){
        //         targetBalance.data[itemId] = 0
        //     }
        //     const targetHists = histories.filter(h => h.itemId == itemId);
        //     if(targetHists.length === 0){
        //         continue;
        //     }
        //     // 直近の履歴にあれば設定する
        //     targetBalance.data[itemId] = targetHists.shift()!.amount
        // }

        targetBalance.dateKey = dateKeyInfo.key
        targetBalance.year = dateKeyInfo.year
        targetBalance.month = dateKeyInfo.month
        targetBalance.userId = this.after.userId
        targetBalance.id = `${this.after.userId}.${dateKeyInfo.key}`

        await admin.firestore().collection("balance")
                .doc(targetBalance.id)
                .set(targetBalance)
        return targetBalance
    }

    protected async commit() {
        await Promise.all(this.targets.map(bls => admin.firestore().collection("balance").doc(bls.id).update(bls)))
    }

    protected async update(journal: DJournal, acc: boolean) {
        const dateInfo = this.createDateInfo(journal.accountAt)
        // console.log(`@balance update: ${acc} ${dateInfo.key}`, JSON.stringify(this.targets))
        for(const bls of this.targets){
            if(bls.dateKey < dateInfo.key){
                // console.log("@skipped.", bls.dateKey,dateInfo.key)
                continue;
            }
            const updateBalance = (details: DJournalDetail[], dAcc:boolean) =>{
                for(const dtl of details){
                    if(!bls.data[dtl.categoryItemId]){
                        bls.data[dtl.categoryItemId] = 0
                        // console.log("@initiate ", dtl.categoryItemId)
                    }
                    bls.data[dtl.categoryItemId] += (dAcc ? 1 : -1) * dtl.amount
                }
                // console.log("@update ", JSON.stringify(this.targets))
            }
            updateBalance(journal.credits, acc)
            updateBalance(journal.debits, !acc)
        }
    }

}