import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import admin from "firebase-admin";

export async function createNewHistoryAfterDate(journal: DJournal) {
    const addNewHistories = (details: DJournalDetail[], acc: boolean = true) => {
        const tasks: Promise<string>[] = []
        for(const dtl of details){
            tasks.push((async () => {
                const latestHistories = (await admin.firestore().collection("history")
                    .where("userId", "==", journal.userId)
                    .where("itemId", "==", dtl.categoryItemId)
                    .where("date", "<", journal.accountAt)
                    .orderBy("date", "desc")
                    .limit(1)
                    .get())
                console.log(`userId:${journal.userId}  itemId:${dtl.categoryItemId}  accountAt:${journal.accountAt} => ${latestHistories.docs.length} latest histories`)
                const baseAmount = latestHistories.docs.length === 0 ? 0 : latestHistories.docs[0].data().amount
                const hist = {
                    itemId: dtl.categoryItemId,
                    amount: baseAmount + (acc ? 1 : -1) * dtl.amount,
                    diff: (acc ? 1 : -1) * dtl.amount,
                    date: journal.accountAt,
                    userId: journal.userId  
                }
                return admin.firestore().collection("history")
                    .add(hist).then(ref => ref.id)
            })()) 
        }
        return tasks
    }
    const addTasks: Promise<string>[] = []
    addTasks.push(...addNewHistories(journal.credits, true))
    addTasks.push(...addNewHistories(journal.debits, false))
    return await Promise.all(addTasks)
}