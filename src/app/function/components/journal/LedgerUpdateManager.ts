import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import UpdateManagerBase from "./UpdateManagerBase";
import admin from "firebase-admin";
import DLedger from "@/app/model/interface/DLedger";

export default class LedgerUpdateManager extends UpdateManagerBase<DLedger>{

    protected async loadTargets() {

        const targetLedgerKeys = Array.from(new Set<string>([this.dateInfoOfAfter.key, this.minDateInfo.key])) // 作成・更新の場合ともに対応
        const ledgers = (await admin.firestore().collection("ledger")
                            .where("userId", "==", this.after.userId)
                            .where("ledgerKey", "in", targetLedgerKeys)
                            .get()
                        ).docs.map(doc => {
                            const led = doc.data() as DLedger
                            led.id = doc.id
                            return led
                        })
    
        
        const ledgerKey = this.dateInfoOfAfter.key
        const ledgerId = `${this.after.userId}.${ledgerKey}`

        if(!ledgers.map(led => led.ledgerKey).includes(ledgerKey)){
            const newLedger = {id: ledgerId, ledgerKey: ledgerKey,userId: this.after.userId, data: {}} as DLedger
            await admin.firestore().collection("ledger")
                .doc(ledgerId).set(newLedger)
            ledgers.push(newLedger)
        }
        this.targets = ledgers
    }


    protected async commit() {
        await Promise.all(this.targets.map(led => admin.firestore().collection("ledger").doc(led.id).update(led)))
    }

    protected async update(journal: DJournal, acc: boolean) {
        console.log("@ledger update ", acc, JSON.stringify(this.targets))

        const dateInfo = this.createDateInfo(journal.accountAt)
        for(const led of this.targets){
            if(led.ledgerKey !== dateInfo.key){
                continue;
            }
            const updateLedger = (details: DJournalDetail[], dAcc:boolean) =>{
                for(const dtl of details) {
                    if(!led.data[dtl.categoryItemId]){
                        led.data[dtl.categoryItemId] = 0
                    }
                    led.data[dtl.categoryItemId] += (dAcc ? 1 : -1) * dtl.amount
                }
            }
            updateLedger(journal.credits,acc)
            updateLedger(journal.debits, !acc)
        }
        console.log("@ledger updated** ", JSON.stringify(this.targets))
    }

}