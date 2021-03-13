
import admin from "firebase-admin";
import * as JournalUtil from "../../util/JournalUtil.mjs"
import * as assert from "../../util/assert.mjs"
import * as commonUtil from "../../util/common.mjs"

const TEST_NAME = "journal__update_test_1"

/**
 * --------------------------------------------------------------------------------------
 * ## test ##
 * 仕訳変更時に履歴が変更されること
 * 
 * --------------------------------------------------------------------------------------
 */
export async function test(context) {

    const categoryItems = await commonUtil.prepareItems(context.user.uid, 2)

    const item1 = categoryItems[0]
    const item2 = categoryItems[1]

    const builder = JournalUtil.builder()
                                .accountAt("2020/12/01")
                                .userId(context.user.uid)
                                .credit(item1.id, 200)
                                .debit( item2.id, 200)
    const addVal = await admin.firestore().collection("journals").add(builder.build())
    await commonUtil.sleepMe(4000)
    await admin.firestore().collection("journals").doc(addVal.id)
                                                .update(builder.modifyCredit(item1.id, 300)
                                                                .modifyDebit(item2.id, 300)
                                                                .build())
    return {
      user: context.user,
      item1:item1,
      item2:item2
    }
}

export async function result(context){
  {
    const histoies = (await admin.firestore().collection("history")
      .where("userId", "==", context.user.uid)
      .where("itemId", "==", context.item1.id)
      .get()).docs.map(doc => doc.data())
    assert.strictEqual(histoies.length, 1)
    assert.strictEqual(histoies[0].amount, 300)
  }
  {
      const histoies = (await admin.firestore().collection("history")
        .where("userId", "==", context.user.uid)
        .where("itemId", "==", context.item2.id)
        .get()).docs.map(doc => doc.data())
      assert.strictEqual(histoies.length, 1)
      assert.strictEqual(histoies[0].amount, -300)
  }
  {
    const dataRef = (await admin.firestore().collection("balance")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const balance = dataRef.data()
    // console.log(balance)
    assert.strictEqual(balance.data[context.item1.id], 300)
    assert.strictEqual(balance.data[context.item2.id], -300)
  }
  {
    const dataRef = (await admin.firestore().collection("ledger")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const ledger = dataRef.data()
    assert.strictEqual(ledger.data[context.item1.id], 300)
    assert.strictEqual(ledger.data[context.item2.id], -300)
  }
}