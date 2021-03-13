import JournalDate from "@/app/function/model/date/JournalDate";
import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal"
import admin from "firebase-admin";
import * as DateUtil from "@/app/function/util/DateUtil"

export async function updateLedger(journal: DJournal, baseAcc: boolean = true) {

    console.log("updateLedger  journal=", JSON.stringify(journal))
    
    const dateConfig = await DateUtil.loadConfig(journal.userId);
    const year = dateConfig.getYearOf(JournalDate.cast(journal.accountAt))
    const month = dateConfig.getMonthOf(JournalDate.cast(journal.accountAt))
    const ledgerKey = `${year}.${month<10?"0":""}${month}`

    const ledgerId = `${journal.userId}.${ledgerKey}`

    const ledgerRes = (await admin.firestore().collection("ledger")
                        .doc(ledgerId)
                        .get()
)
    const ledger = await  (async () => {
        if(ledgerRes.exists){
            return ledgerRes.data()!
        }
        const newLedger = {id: ledgerId, ledgerKey: ledgerKey,uesrId: journal.userId, data: {}}
        await admin.firestore().collection("ledger")
            .doc(ledgerId).set(newLedger)
        return newLedger
    })()

    const updateAmountOfLedger = (details: DJournalDetail[], acc: boolean = true) => {
        for(const dtl of details) {
            if(!ledger.data[dtl.categoryItemId]){
                ledger.data[dtl.categoryItemId] = 0
            }
            ledger.data[dtl.categoryItemId] += (acc ? 1 : -1) * dtl.amount
        }
    }
    updateAmountOfLedger(journal.credits, baseAcc)
    updateAmountOfLedger(journal.debits, !baseAcc)

    console.log("updateLedger updating ledger=", JSON.stringify(ledger))

    await admin.firestore().collection("ledger")
        .doc(ledgerId)
        .update(ledger)
}