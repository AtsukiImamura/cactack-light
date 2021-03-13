import { DJournal } from "@/app/model/interface/DJournal";
import * as functions from "firebase-functions";
// import * as LedgerHelper from "@/app/function/components/journal/LedgerHelper"
// import * as BalanceHelper from "@/app/function/components/journal/BalanceHelper"
import HistoryUpdateManager from "@/app/function/components/journal/HistoryUpdateManager"
import BalanceUpdateManager from "./BalanceUpdateManager";
import LedgerUpdateManager from "./LedgerUpdateManager";

/**
 * 仕訳が更新された場合の処理
 * @param change 
 * @param context 
 */
export default async function onJournalUpdated(change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) {
    const before = change.before.data() as DJournal
    const after = change.after.data() as DJournal

    console.log("before", JSON.stringify(before))
    console.log("after", JSON.stringify(after))

    // 削除された（不可視になった）場合は値を０として扱う
    if((before.visible && !after.visible) || (!before.deletedAt && after.deletedAt !== "")){
        after.credits = after.credits.map(d => {
            d.amount = 0
            return d;
        })
        after.debits = after.credits.map(d => {
            d.amount = 0
            return d;
        })
    }

    
    // ---------------------------------------------------------------------
    //    history
    // ---------------------------------------------------------------------
    await (new HistoryUpdateManager(after, before)).execute()


    //---------------------------------------------------------------------
    //    ledger / balance
    // ---------------------------------------------------------------------
    Promise.all([
        // Promise.resolve()
        //     .then(() => LedgerHelper.updateLedger(before, false))
        //     .then(() => LedgerHelper.updateLedger(after, true)),
        new LedgerUpdateManager(after, before).execute(),
        // Promise.resolve()
        //     .then(() => BalanceHelper.updateBalance(before, false))
        //     .then(() => BalanceHelper.updateBalance(after, true))
        new BalanceUpdateManager(after,before).execute()

    ])
}