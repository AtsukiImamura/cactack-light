"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateManagerBase_1 = __importDefault(require("./UpdateManagerBase"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class LedgerUpdateManager extends UpdateManagerBase_1.default {
    async loadTargets() {
        const targetLedgerKeys = Array.from(new Set([this.dateInfoOfAfter.key, this.minDateInfo.key])); // 作成・更新の場合ともに対応
        const ledgers = (await firebase_admin_1.default.firestore().collection("ledger")
            .where("userId", "==", this.after.userId)
            .where("ledgerKey", "in", targetLedgerKeys)
            .get()).docs.map(doc => {
            const led = doc.data();
            led.id = doc.id;
            return led;
        });
        const ledgerKey = this.dateInfoOfAfter.key;
        const ledgerId = `${this.after.userId}.${ledgerKey}`;
        if (!ledgers.map(led => led.ledgerKey).includes(ledgerKey)) {
            const newLedger = { id: ledgerId, ledgerKey: ledgerKey, userId: this.after.userId, data: {} };
            await firebase_admin_1.default.firestore().collection("ledger")
                .doc(ledgerId).set(newLedger);
            ledgers.push(newLedger);
        }
        this.targets = ledgers;
    }
    async commit() {
        await Promise.all(this.targets.map(led => firebase_admin_1.default.firestore().collection("ledger").doc(led.id).update(led)));
    }
    async update(journal, acc) {
        console.log("@ledger update ", acc, JSON.stringify(this.targets));
        const dateInfo = this.createDateInfo(journal.accountAt);
        for (const led of this.targets) {
            if (led.ledgerKey !== dateInfo.key) {
                continue;
            }
            const updateLedger = (details, dAcc) => {
                for (const dtl of details) {
                    if (!led.data[dtl.categoryItemId]) {
                        led.data[dtl.categoryItemId] = 0;
                    }
                    led.data[dtl.categoryItemId] += (dAcc ? 1 : -1) * dtl.amount;
                }
            };
            updateLedger(journal.credits, acc);
            updateLedger(journal.debits, !acc);
        }
        console.log("@ledger updated** ", JSON.stringify(this.targets));
    }
}
exports.default = LedgerUpdateManager;
