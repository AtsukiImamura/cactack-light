
import admin from "firebase-admin";
import * as JournalUtil from "../../util/JournalUtil.mjs"
import * as assert from "../../util/assert.mjs"
import * as commonUtil from "../../util/common.mjs"

const TEST_NAME = "journal__update_test_5"

/**
 * --------------------------------------------------------------------------------------
 * ## test ##
 * 同一日付の仕訳が複数あって、一部を更新した場合に履歴が正しく更新されること
 * --------------------------------------------------------------------------------------
 */
export async function test(context) {

    const categoryItems = await commonUtil.prepareItems(context.user.uid, 2, TEST_NAME)

    const item1 = categoryItems[0]
    const item2 = categoryItems[1]
    
    await admin.firestore().collection("journals")
        .add(JournalUtil.builder()
                        .accountAt("2020/12/01")
                        .userId(context.user.uid)
                        .credit(item1.id, 200)
                        .debit( item2.id, 200)
                        .build()
        )
    await commonUtil.sleepMe(4000)
    const builder = JournalUtil.builder()
                          .accountAt("2020/12/01")
                          .userId(context.user.uid)
                          .credit(item1.id, 300)
                          .debit( item2.id, 300)
    await commonUtil.sleepMe(4000)
        
    await admin.firestore().collection("journals")
    .add(JournalUtil.builder()
                    .accountAt("2020/12/04")
                    .userId(context.user.uid)
                    .credit(item1.id, 150)
                    .debit( item2.id, 150)
                    .build())
    await commonUtil.sleepMe(4500)
    const addVal = await admin.firestore().collection("journals").add(builder.build())
        await commonUtil.sleepMe(2000)
        await admin.firestore().collection("journals").doc(addVal.id)
                                                .update(builder.modifyCredit(item1.id, 500)
                                                                .modifyDebit(item2.id, 500)
                                                                .build())
    return {
      user: context.user,
      item1: item1,
      item2: item2
    }
}


export async function result(context) {
  {
    const histoies = (await admin.firestore().collection("history")
      .where("userId", "==", context.user.uid)
      .where("itemId", "==", context.item1.id)
      .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
    assert.strictEqual(histoies.length,2)
    assert.strictEqual(histoies[0].amount,700)
    assert.strictEqual(histoies[0].diff,700)
    assert.strictEqual(histoies[0].date,"2020/12/01")
    assert.strictEqual(histoies[1].amount,850)
    assert.strictEqual(histoies[1].diff,150)
    assert.strictEqual(histoies[1].date,"2020/12/04")
  }
  {
    const dataRef = (await admin.firestore().collection("balance")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const balance = dataRef.data()
    assert.strictEqual(balance.data[context.item1.id], 850)
    assert.strictEqual(balance.data[context.item2.id], -850)
  }
  {
    const dataRef = (await admin.firestore().collection("ledger")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const ledger = dataRef.data()
    assert.strictEqual(ledger.data[context.item1.id], 850)
    assert.strictEqual(ledger.data[context.item2.id], -850)
  }
}