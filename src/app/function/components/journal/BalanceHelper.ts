import JournalDate from "@/app/function/model/date/JournalDate";
import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import admin from "firebase-admin";
import * as DateUtil from "@/app/function/util/DateUtil"
import DHistory from "@/app/model/interface/DHistory";

export async function updateBalance(journal: DJournal, baseAcc: boolean){{
    
    const dateConfig = await DateUtil.loadConfig(journal.userId);
    const year = dateConfig.getYearOf(JournalDate.cast(journal.accountAt))
    const month = dateConfig.getMonthOf(JournalDate.cast(journal.accountAt))

    const dateKey = `${year}.${month < 10 ? "0" : ""}${month}`

    const balances = (await admin.firestore().collection("balance")
                .where("userId", "==", journal.userId)
                .where("dateKey", ">=", dateKey)
                .get()
            ).docs
            .map(doc => {
                const bls = doc.data()
                bls.id = doc.id
                return bls
            })
    console.log(`dateKey=${dateKey}  balances=${JSON.stringify(balances)}`)

    // 今月がない場合は作成してリストに加える
    if(!balances.map(b => b.dateKey).includes(dateKey)){
        if(!baseAcc){
            console.warn(`Balance of ${year}/${month} is expected to exist.`)
        }
        await (async () => {
            const pastBalances = (await admin.firestore().collection("balance")    
                .where("userId", "==", journal.userId)
                .where("dateKey", "<", dateKey)
                .orderBy("dateKey", "desc")
                .limit(1)
                .get()
            ).docs
            .map(doc => {
                const bls = doc.data()
                bls.id = doc.id
                return bls
            })
            const targetBalance = pastBalances.length === 0 ? {year: year, month: month, dateKey: dateKey, data: {}, userId: journal.userId} : pastBalances[0]

            console.log(`got ${pastBalances.length} pastBalances.`)

            // 過去の履歴の中から直近のものを足す
            const histories = (await (() => {
                const ql = admin.firestore().collection("history")
                    .where("userId", "==", journal.userId)
                    .where("date", "<=", dateConfig.lastDayOf(year, month).toString())
                if(targetBalance.year){
                    return ql.where("date", ">=", dateConfig.firstDayOf(year, month).toString())
                }else {
                    return ql
                }
            })().get()).docs.map(doc => {
                const hist = doc.data()
                hist.id = doc.id
                return hist as DHistory
            }).sort((a,b) => a.date < b.date ? 1:-1)

            const itemIds = Array.from(new Set(histories.map(h => h.itemId))) // 項目IDの重複をなくす

            for(const itemId of itemIds){
                // 直近の表にない場合はまず0とする
                if(itemId in targetBalance.data){
                    targetBalance.data[itemId] = 0
                }
                const targetHists = histories.filter(h => h.itemId == itemId);
                if(targetHists.length === 0){
                    continue;
                }
                // 直近の履歴にあれば加算する（履歴は月ごとにリセット）
                targetBalance.data[itemId] += targetHists.shift()!.amount
            }

            targetBalance.dateKey = dateKey
            targetBalance.year = year
            targetBalance.month = month
            targetBalance.userId = journal.userId

            await admin.firestore().collection("balance")
                    .doc(`${journal.userId}.${dateKey}`)
                    .set(targetBalance)
            balances.push(targetBalance)
            console.log(`balance of this month created. ${JSON.stringify(targetBalance)}`)
        })()
        
    }

    const updateAmountOfBalance = (details: DJournalDetail[], acc: boolean = true) => {
        for(const dtl of details) {
            for(const balance of balances){
                if(!balance.data[dtl.categoryItemId]){
                    balance.data[dtl.categoryItemId] = 0
                }
                balance.data[dtl.categoryItemId] += (acc ? 1 : -1) * dtl.amount
            }
        }
    }
    updateAmountOfBalance(journal.credits, baseAcc)
    updateAmountOfBalance(journal.debits, !baseAcc)

    await Promise.all(balances.map(balance => admin.firestore().collection("balance")
            .doc(`${journal.userId}.${balance.dateKey}`)
            .set(balance))
        )
    console.log(`${balances.length} balances updated. ${JSON.stringify(balances)}`)
}}