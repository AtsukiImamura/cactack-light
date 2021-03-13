import { DJournal } from "@/app/model/interface/DJournal";
import BalanceUpdateManager from "./BalanceUpdateManager";
import HistoryUpdateManager from "./HistoryUpdateManager";
import LedgerUpdateManager from "./LedgerUpdateManager";

/**
 * 仕訳が作成された場合の処理
 * @param snapshot 
 * @param context 
 */
export default async function onJournalCreated(journal: DJournal) {
    await Promise.all(
        [
            doHistory(journal),
            doLedger(journal),
            doBalance(journal)
        ]
    )
}


async function doLedger(journal: DJournal){
    await new LedgerUpdateManager(journal).execute()
}

/**
 * 貸借対照表
 * 月末を基準として作成する
 * @param journal 
 */
async function doBalance(journal: DJournal){
    await (new BalanceUpdateManager(journal)).execute()
}


/**
 * 日次履歴
 * @param journal 
 */
async function doHistory(journal: DJournal) {
    await (new HistoryUpdateManager(journal)).execute()
}