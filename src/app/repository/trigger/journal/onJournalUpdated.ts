import { DJournal } from "@/app/model/interface/DJournal";
import HistoryUpdateManager from "@/app/repository/trigger/journal/HistoryUpdateManager"
import BalanceUpdateManager from "@/app/repository/trigger/journal/BalanceUpdateManager";
import LedgerUpdateManager from "@/app/repository/trigger/journal/LedgerUpdateManager";

/**
 * 仕訳が更新された場合の処理
 * @param change 
 * @param context 
 */
export default async function onJournalUpdated(before: DJournal, after: DJournal) {
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
        // console.log("journal is treated as invisible or deleted.")
    }

    
    // ---------------------------------------------------------------------
    //    history
    // ---------------------------------------------------------------------
    await (new HistoryUpdateManager(after, before)).execute()


    //---------------------------------------------------------------------
    //    ledger / balance
    // ---------------------------------------------------------------------
    await Promise.all([
        new LedgerUpdateManager(after, before).execute(),
        new BalanceUpdateManager(after,before).execute()
    ])
}