import { DJournal } from "@/app/model/interface/DJournal";
// import admin from "firebase-admin";
import * as functions from "firebase-functions";
// import DHistory from "@/app/model/interface/DHistory";
// import * as LedgerHelper from "@/app/function/components/journal/LedgerHelper"
// import * as BalanceHelper from "@/app/function/components/journal/BalanceHelper"
// import * as HistoryHelper from "@/app/function/components/journal/HistoryHelper"
import HistoryUpdateManager from "@/app/function/components/journal/HistoryUpdateManager"
import BalanceUpdateManager from "./BalanceUpdateManager";
import LedgerUpdateManager from "./LedgerUpdateManager";

/**
 * 仕訳が作成された場合の処理
 * @param snapshot 
 * @param context 
 */
export default async function onJournalCreated(snapshot: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) {
    await Promise.all(
        [
            doHistory(snapshot.data() as DJournal),
            doLedger(snapshot.data() as DJournal),
            doBalance(snapshot.data() as DJournal)
        ]
    )
}


async function doLedger(journal: DJournal){
    // await LedgerHelper.updateLedger(journal, true)
    await new LedgerUpdateManager(journal).execute()
}

/**
 * 貸借対照表
 * 月末を基準として作成する
 * @param journal 
 */
async function doBalance(journal: DJournal){
    // await BalanceHelper.updateBalance(journal, true)
    await (new BalanceUpdateManager(journal)).execute()
}


/**
 * 日次履歴
 * @param journal 
 */
async function doHistory(journal: DJournal) {
    // const itemIds = [...journal.credits, ...journal.debits].map(d => d.categoryItemId)

    // const histories = (await admin.firestore().collection("history")
    //     .where("userId", "==", journal.userId)
    //     .where("itemId", "in", itemIds)
    //     .where("date", ">=", journal.accountAt)
    //     .get()).docs.map(doc => {
    //         const hist = doc.data()
    //         hist.id = doc.id
    //         return hist as DHistory
    //     })
    // const histMap = histories.reduce((acc, cur) => {
    //     if(!acc.has(cur.itemId)){
    //         acc.set(cur.itemId, []);
    //     }
    //     acc.get(cur.itemId)!.push(cur)
    //     return acc;
    // }, new Map<string, DHistory[]>())

    // // TODO: 仕訳項目の重複チェック

    // // 対象日の履歴がない場合
    // if(histories.filter(hist => hist.date === journal.accountAt).length === 0){
    //     await HistoryHelper.createNewHistoryAfterDate(journal)
    //     // const addNewHistories = (details: DJournalDetail[], acc: boolean = true) => {
    //     //     const tasks: Promise<any>[] = []
    //     //     for(const dtl of details){
    //     //         tasks.push((async () => {
    //     //             const latestHistories = (await admin.firestore().collection("history")
    //     //                 .where("userId", "==", journal.userId)
    //     //                 .where("itemId", "==", dtl.categoryItemId)
    //     //                 .where("date", "<", journal.accountAt)
    //     //                 .orderBy("date", "desc")
    //     //                 .limit(1)
    //     //                 .get())
    //     //             console.log(`userId:${journal.userId}  itemId:${dtl.categoryItemId}  accountAt:${journal.accountAt} => ${latestHistories.docs.length} latest histories`)
    //     //             const baseAmount = latestHistories.docs.length === 0 ? 0 : latestHistories.docs[0].data().amount
    //     //             await admin.firestore().collection("history")
    //     //                 .add({
    //     //                     itemId: dtl.categoryItemId,
    //     //                     amount: baseAmount + (acc ? 1 : -1) * dtl.amount,
    //     //                     diff: (acc ? 1 : -1) * dtl.amount,
    //     //                     date: journal.accountAt,
    //     //                     userId: journal.userId  
    //     //                 })
    //     //         })()) 
    //     //     }
    //     //     return tasks
    //     // }
    //     // const addTasks: Promise<any>[] = []
    //     // addTasks.push(...addNewHistories(journal.credits, true))
    //     // addTasks.push(...addNewHistories(journal.debits, false))
    //     // await Promise.all(addTasks)
    // }
    // const updateHist = (map: Map<string, DHistory[]>, details: DJournalDetail[], acc: boolean = true): Promise<void>[] => {
    //     const tasks: Promise<any>[] = []
    //     for(const dtl of details){
    //         const hists = map.get(dtl.categoryItemId)
    //         if(!hists){
    //             continue;
    //         }
    //         for(const hist of hists){
    //             hist.amount += (acc ? 1 : -1) * dtl.amount
    //             hist.diff += (acc ? 1 : -1) * dtl.amount
    //             tasks.push(admin.firestore().collection("history").doc(hist.id).update(hist))
    //         }
    //     }
    //     return tasks;
    // }
    // const udpateTasks: Promise<any>[] = []
    // udpateTasks.push(...updateHist(histMap, journal.credits, true));
    // udpateTasks.push(...updateHist(histMap, journal.debits, false));

    // console.log(`update: ${udpateTasks.length} histories.`)
    // await Promise.all(udpateTasks)

    await (new HistoryUpdateManager(journal)).execute()

}