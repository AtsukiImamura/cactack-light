
import admin from "firebase-admin";
import * as JournalUtil from "../../util/JournalUtil.mjs"
import * as assert from "../../util/assert.mjs"
import * as commonUtil from "../../util/common.mjs"

const TEST_NAME = "journal__update_test_6"
/**
 * --------------------------------------------------------------------------------------
 * ## test ##
 * 仕訳の月を変更した場合に正しく更新されること
 * 
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
    await commonUtil.sleepMe(5000)
    const builder = JournalUtil.builder()
                              .accountAt("2020/11/20")
                              .userId(context.user.uid)
                              .credit(item1.id, 300)
                              .debit( item2.id, 300)
    const addVal = await admin.firestore().collection("journals").add(builder.build())
    await commonUtil.sleepMe(6000)
    await admin.firestore().collection("journals").doc(addVal.id)
                                                .update(builder.accountAt("2020/12/03")
                                                                .build())
    return {
      user:  context.user,
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
    assert.strictEqual(histoies.length,3)
    assert.strictEqual(histoies[0].amount,0)
    assert.strictEqual(histoies[0].diff,0)
    assert.strictEqual(histoies[0].date,"2020/11/20")
    assert.strictEqual(histoies[1].amount,200)
    assert.strictEqual(histoies[1].diff,200)
    assert.strictEqual(histoies[1].date,"2020/12/01")
    assert.strictEqual(histoies[2].amount,500)
    assert.strictEqual(histoies[2].diff,300)
    assert.strictEqual(histoies[2].date,"2020/12/03")
  }
  {
    const dataRef = (await admin.firestore().collection("balance")
      .doc(`${context.user.uid}.2020.11`).get())
    assert.strictEqual(dataRef.exists, true)
    const balance = dataRef.data()
    assert.strictEqual(balance.data[context.item1.id], 0)
    assert.strictEqual(balance.data[context.item2.id], 0)
  }
  {
    const dataRef = (await admin.firestore().collection("balance")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const balance = dataRef.data()
    assert.strictEqual(balance.data[context.item1.id], 500)
    assert.strictEqual(balance.data[context.item2.id], -500)
  }
  {
    const dataRef = (await admin.firestore().collection("ledger")
      .doc(`${context.user.uid}.2020.11`).get())
    assert.strictEqual(dataRef.exists, true)
    const ledger = dataRef.data()
    assert.strictEqual(ledger.data[context.item1.id], 0)
    assert.strictEqual(ledger.data[context.item2.id], 0)
  }
  {
    const dataRef = (await admin.firestore().collection("ledger")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const ledger = dataRef.data()
    assert.strictEqual(ledger.data[context.item1.id], 500)
    assert.strictEqual(ledger.data[context.item2.id], -500)
  }
}