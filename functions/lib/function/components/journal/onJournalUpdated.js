"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as LedgerHelper from "../../../function/components/journal/LedgerHelper"
// import * as BalanceHelper from "../../../function/components/journal/BalanceHelper"
const HistoryUpdateManager_1 = __importDefault(require("../../../function/components/journal/HistoryUpdateManager"));
const BalanceUpdateManager_1 = __importDefault(require("./BalanceUpdateManager"));
const LedgerUpdateManager_1 = __importDefault(require("./LedgerUpdateManager"));
/**
 * 仕訳が更新された場合の処理
 * @param change
 * @param context
 */
async function onJournalUpdated(change, context) {
    const before = change.before.data();
    const after = change.after.data();
    console.log("before", JSON.stringify(before));
    console.log("after", JSON.stringify(after));
    // 削除された（不可視になった）場合は値を０として扱う
    if ((before.visible && !after.visible) || (!before.deletedAt && after.deletedAt !== "")) {
        after.credits = after.credits.map(d => {
            d.amount = 0;
            return d;
        });
        after.debits = after.credits.map(d => {
            d.amount = 0;
            return d;
        });
    }
    // ---------------------------------------------------------------------
    //    history
    // ---------------------------------------------------------------------
    await (new HistoryUpdateManager_1.default(after, before)).execute();
    //---------------------------------------------------------------------
    //    ledger / balance
    // ---------------------------------------------------------------------
    Promise.all([
        // Promise.resolve()
        //     .then(() => LedgerHelper.updateLedger(before, false))
        //     .then(() => LedgerHelper.updateLedger(after, true)),
        new LedgerUpdateManager_1.default(after, before).execute(),
        // Promise.resolve()
        //     .then(() => BalanceHelper.updateBalance(before, false))
        //     .then(() => BalanceHelper.updateBalance(after, true))
        new BalanceUpdateManager_1.default(after, before).execute()
    ]);
}
exports.default = onJournalUpdated;
