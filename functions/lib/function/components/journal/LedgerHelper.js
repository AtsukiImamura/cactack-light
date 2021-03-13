"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLedger = void 0;
const JournalDate_1 = __importDefault(require("../../../function/model/date/JournalDate"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const DateUtil = __importStar(require("../../../function/util/DateUtil"));
async function updateLedger(journal, baseAcc = true) {
    console.log("updateLedger  journal=", JSON.stringify(journal));
    const dateConfig = await DateUtil.loadConfig(journal.userId);
    const year = dateConfig.getYearOf(JournalDate_1.default.cast(journal.accountAt));
    const month = dateConfig.getMonthOf(JournalDate_1.default.cast(journal.accountAt));
    const ledgerKey = `${year}.${month < 10 ? "0" : ""}${month}`;
    const ledgerId = `${journal.userId}.${ledgerKey}`;
    const ledgerRes = (await firebase_admin_1.default.firestore().collection("ledger")
        .doc(ledgerId)
        .get());
    const ledger = await (async () => {
        if (ledgerRes.exists) {
            return ledgerRes.data();
        }
        const newLedger = { id: ledgerId, ledgerKey: ledgerKey, uesrId: journal.userId, data: {} };
        await firebase_admin_1.default.firestore().collection("ledger")
            .doc(ledgerId).set(newLedger);
        return newLedger;
    })();
    const updateAmountOfLedger = (details, acc = true) => {
        for (const dtl of details) {
            if (!ledger.data[dtl.categoryItemId]) {
                ledger.data[dtl.categoryItemId] = 0;
            }
            ledger.data[dtl.categoryItemId] += (acc ? 1 : -1) * dtl.amount;
        }
    };
    updateAmountOfLedger(journal.credits, baseAcc);
    updateAmountOfLedger(journal.debits, !baseAcc);
    console.log("updateLedger updating ledger=", JSON.stringify(ledger));
    await firebase_admin_1.default.firestore().collection("ledger")
        .doc(ledgerId)
        .update(ledger);
}
exports.updateLedger = updateLedger;
