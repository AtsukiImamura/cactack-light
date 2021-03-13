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
exports.updateBalance = void 0;
const JournalDate_1 = __importDefault(require("../../../function/model/date/JournalDate"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const DateUtil = __importStar(require("../../../function/util/DateUtil"));
async function updateBalance(journal, baseAcc) {
    {
        const dateConfig = await DateUtil.loadConfig(journal.userId);
        const year = dateConfig.getYearOf(JournalDate_1.default.cast(journal.accountAt));
        const month = dateConfig.getMonthOf(JournalDate_1.default.cast(journal.accountAt));
        const dateKey = `${year}.${month < 10 ? "0" : ""}${month}`;
        const balances = (await firebase_admin_1.default.firestore().collection("balance")
            .where("userId", "==", journal.userId)
            .where("dateKey", ">=", dateKey)
            .get()).docs
            .map(doc => {
            const bls = doc.data();
            bls.id = doc.id;
            return bls;
        });
        console.log(`dateKey=${dateKey}  balances=${JSON.stringify(balances)}`);
        // 今月がない場合は作成してリストに加える
        if (!balances.map(b => b.dateKey).includes(dateKey)) {
            if (!baseAcc) {
                console.warn(`Balance of ${year}/${month} is expected to exist.`);
            }
            await (async () => {
                const pastBalances = (await firebase_admin_1.default.firestore().collection("balance")
                    .where("userId", "==", journal.userId)
                    .where("dateKey", "<", dateKey)
                    .orderBy("dateKey", "desc")
                    .limit(1)
                    .get()).docs
                    .map(doc => {
                    const bls = doc.data();
                    bls.id = doc.id;
                    return bls;
                });
                const targetBalance = pastBalances.length === 0 ? { year: year, month: month, dateKey: dateKey, data: {}, userId: journal.userId } : pastBalances[0];
                console.log(`got ${pastBalances.length} pastBalances.`);
                // 過去の履歴の中から直近のものを足す
                const histories = (await (() => {
                    const ql = firebase_admin_1.default.firestore().collection("history")
                        .where("userId", "==", journal.userId)
                        .where("date", "<=", dateConfig.lastDayOf(year, month).toString());
                    if (targetBalance.year) {
                        return ql.where("date", ">=", dateConfig.firstDayOf(year, month).toString());
                    }
                    else {
                        return ql;
                    }
                })().get()).docs.map(doc => {
                    const hist = doc.data();
                    hist.id = doc.id;
                    return hist;
                }).sort((a, b) => a.date < b.date ? 1 : -1);
                const itemIds = Array.from(new Set(histories.map(h => h.itemId))); // 項目IDの重複をなくす
                for (const itemId of itemIds) {
                    // 直近の表にない場合はまず0とする
                    if (itemId in targetBalance.data) {
                        targetBalance.data[itemId] = 0;
                    }
                    const targetHists = histories.filter(h => h.itemId == itemId);
                    if (targetHists.length === 0) {
                        continue;
                    }
                    // 直近の履歴にあれば加算する（履歴は月ごとにリセット）
                    targetBalance.data[itemId] += targetHists.shift().amount;
                }
                targetBalance.dateKey = dateKey;
                targetBalance.year = year;
                targetBalance.month = month;
                targetBalance.userId = journal.userId;
                await firebase_admin_1.default.firestore().collection("balance")
                    .doc(`${journal.userId}.${dateKey}`)
                    .set(targetBalance);
                balances.push(targetBalance);
                console.log(`balance of this month created. ${JSON.stringify(targetBalance)}`);
            })();
        }
        const updateAmountOfBalance = (details, acc = true) => {
            for (const dtl of details) {
                for (const balance of balances) {
                    if (!balance.data[dtl.categoryItemId]) {
                        balance.data[dtl.categoryItemId] = 0;
                    }
                    balance.data[dtl.categoryItemId] += (acc ? 1 : -1) * dtl.amount;
                }
            }
        };
        updateAmountOfBalance(journal.credits, baseAcc);
        updateAmountOfBalance(journal.debits, !baseAcc);
        await Promise.all(balances.map(balance => firebase_admin_1.default.firestore().collection("balance")
            .doc(`${journal.userId}.${balance.dateKey}`)
            .set(balance)));
        console.log(`${balances.length} balances updated. ${JSON.stringify(balances)}`);
    }
}
exports.updateBalance = updateBalance;
