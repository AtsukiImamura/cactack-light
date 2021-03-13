"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const UpdateManagerBase_1 = __importDefault(require("./UpdateManagerBase"));
/**
 * 履歴の更新管理
 */
class HistoryUpdateManager extends UpdateManagerBase_1.default {
    get relatedItemIds() {
        const itemIds = [...this.after.credits, ...this.after.debits].map(d => d.categoryItemId);
        if (this.before) {
            itemIds.push(...this.before.credits.map(d => d.categoryItemId));
            itemIds.push(...this.before.debits.map(d => d.categoryItemId));
        }
        return Array.from(itemIds);
    }
    get historyMap() {
        return this.targets.reduce((map, hist) => {
            if (!map.has(hist.itemId)) {
                map.set(hist.itemId, []);
            }
            map.get(hist.itemId).push(hist);
            return map;
        }, new Map());
    }
    /**
     * 更新対象となる履歴を読み込む
     * 対象としている仕訳分の履歴がない場合は追加してから読み込む
     */
    async loadTargets() {
        const histories = [];
        let itemCnt = 0;
        while (true) {
            const itemIds = this.relatedItemIds.slice(itemCnt, (itemCnt += 10) - 1);
            if (itemIds.length === 0) {
                break;
            }
            histories.push(...await this.loadHistoriesByItemIds(itemIds));
        }
        // 対象仕訳分の履歴がなければ追加
        if (histories.filter(h => h.date === this.after.accountAt).length === 0) {
            const histIds = await this.createHistoryOfAfterJournal();
            histories.push(...await Promise.all(histIds.map(async (id) => firebase_admin_1.default.firestore().collection("history")
                .doc(id)
                .get()
                .then(doc => { const hist = doc.data(); hist.id = doc.id; return hist; }))));
        }
        this.targets = histories;
    }
    /**
     * 扱っている仕訳のユーザで、更新対象となる、指定された仕訳項目の履歴を読み込む
     * @param itemIds
     */
    async loadHistoriesByItemIds(itemIds) {
        // firestoreの仕様に合わせる
        if (itemIds.length > 10) {
            throw new Error("length of itemIds must not be greater than 10.");
        }
        return (await firebase_admin_1.default.firestore().collection("history")
            .where("userId", "==", this.after.userId)
            .where("itemId", "in", Array.from(itemIds)) // itemDiffMapには関係するすべての仕訳項目が入っている
            .where("date", ">=", this.minDate)
            .get()).docs.map(doc => {
            const hist = doc.data();
            hist.id = doc.id;
            return hist;
        });
    }
    /**
     * 保持する履歴を更新する
     * @param journal
     * @param acc 更新モード（true:増分、 false:差分）
     */
    async update(journal, acc = true) {
        const updateDetails = (details, acc = true) => {
            for (const dtl of details) {
                const itemId = dtl.categoryItemId;
                if (!this.historyMap.has(itemId)) {
                    continue;
                }
                const histories = this.historyMap.get(itemId);
                for (const hist of histories) {
                    // 自分よりも前の履歴に更新を入れない
                    if (hist.date < journal.accountAt) {
                        continue;
                    }
                    const diff = (acc ? 1 : -1) * dtl.amount;
                    hist.amount += diff;
                    // 当日なら差分も更新する
                    if (hist.date === journal.accountAt) {
                        hist.diff += diff;
                    }
                }
            }
        };
        updateDetails(journal.credits, acc);
        updateDetails(journal.debits, !acc);
    }
    /**
     * 保持する履歴をすべて確定させる
     */
    async commit() {
        await Promise.all(this.targets.map(hist => firebase_admin_1.default.firestore().collection("history").doc(hist.id).update(hist)));
    }
    /**
     * 今回対象の仕訳の日付の履歴を作成する
     */
    async createHistoryOfAfterJournal() {
        const addNewHistories = (details) => {
            const tasks = [];
            for (const dtl of details) {
                tasks.push((async () => {
                    const latestHistories = (await firebase_admin_1.default.firestore().collection("history")
                        .where("userId", "==", this.after.userId)
                        .where("itemId", "==", dtl.categoryItemId)
                        .where("date", "<", this.after.accountAt)
                        .orderBy("date", "desc")
                        .limit(1)
                        .get());
                    const baseAmount = latestHistories.docs.length === 0 ? 0 : latestHistories.docs[0].data().amount;
                    const hist = {
                        itemId: dtl.categoryItemId,
                        amount: baseAmount,
                        diff: 0,
                        date: this.after.accountAt,
                        userId: this.after.userId
                    };
                    return firebase_admin_1.default.firestore().collection("history")
                        .add(hist).then(ref => ref.id);
                })());
            }
            return tasks;
        };
        const addTasks = [];
        addTasks.push(...addNewHistories(this.after.credits));
        addTasks.push(...addNewHistories(this.after.debits));
        return await Promise.all(addTasks);
    }
}
exports.default = HistoryUpdateManager;
