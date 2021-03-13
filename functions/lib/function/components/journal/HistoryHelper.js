"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewHistoryAfterDate = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function createNewHistoryAfterDate(journal) {
    const addNewHistories = (details, acc = true) => {
        const tasks = [];
        for (const dtl of details) {
            tasks.push((async () => {
                const latestHistories = (await firebase_admin_1.default.firestore().collection("history")
                    .where("userId", "==", journal.userId)
                    .where("itemId", "==", dtl.categoryItemId)
                    .where("date", "<", journal.accountAt)
                    .orderBy("date", "desc")
                    .limit(1)
                    .get());
                console.log(`userId:${journal.userId}  itemId:${dtl.categoryItemId}  accountAt:${journal.accountAt} => ${latestHistories.docs.length} latest histories`);
                const baseAmount = latestHistories.docs.length === 0 ? 0 : latestHistories.docs[0].data().amount;
                const hist = {
                    itemId: dtl.categoryItemId,
                    amount: baseAmount + (acc ? 1 : -1) * dtl.amount,
                    diff: (acc ? 1 : -1) * dtl.amount,
                    date: journal.accountAt,
                    userId: journal.userId
                };
                return firebase_admin_1.default.firestore().collection("history")
                    .add(hist).then(ref => ref.id);
            })());
        }
        return tasks;
    };
    const addTasks = [];
    addTasks.push(...addNewHistories(journal.credits, true));
    addTasks.push(...addNewHistories(journal.debits, false));
    return await Promise.all(addTasks);
}
exports.createNewHistoryAfterDate = createNewHistoryAfterDate;
