
import admin from "firebase-admin";
import * as JournalUtil from "../../util/JournalUtil.mjs"
import * as assert from "../../util/assert.mjs"
import * as commonUtil from "../../util/common.mjs"

const TEST_NAME = "journal__update_test_4"

/**
 * --------------------------------------------------------------------------------------
 * ## test ##
 * 既存の仕訳が３つ以上ある場合で、2つの仕訳の作成日時の中間のものを更新した場合に、
 * 　・既存の仕訳で作成日が早いものの履歴は更新されないこと
 * 　・更新した仕訳分の履歴が更新されること
 * 　・既存の仕訳で作成日が遅いものは更新した仕訳の分で更新されること
 * --------------------------------------------------------------------------------------
 */
export async function test(context) {

    const categoryItems = await commonUtil.prepareItems(context.user.uid, 3, TEST_NAME)

    const item1 = categoryItems[0]
    const item2 = categoryItems[1]
    const item3 = categoryItems[2]
    
    await admin.firestore().collection("journals")
        .add(JournalUtil.builder()
                        .accountAt("2020/12/01")
                        .userId(context.user.uid)
                        .credit(item1.id, 200)
                        .debit( item2.id, 200)
                        .build()
        )
    await commonUtil.sleepMe(3000)
    await admin.firestore().collection("journals")
        .add(JournalUtil.builder()
                        .accountAt("2020/12/10")
                        .userId(context.user.uid)
                        .credit(item1.id, 300)
                        .debit( item2.id, 300)
                        .build()
        )
    await commonUtil.sleepMe(3000)
    const builder = JournalUtil.builder()
                                .accountAt("2020/12/05")
                                .userId(context.user.uid)
                                .credit(item1.id, 400)
                                .debit( item2.id, 400)
    const addVal = await admin.firestore().collection("journals").add(builder.build())
    await commonUtil.sleepMe(4000)
    await admin.firestore().collection("journals").doc(addVal.id)
                                  .update(builder.modifyCredit(item1.id, 500)
                                                  .modifyDebit(item2.id, 500)
                                                  .build())


    // await commonUtil.sleepMe(12000)
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
    assert.strictEqual(histoies.length,3)
    assert.strictEqual(histoies[0].amount,200)
    assert.strictEqual(histoies[0].date,"2020/12/01")
    assert.strictEqual(histoies[1].amount,700)
    assert.strictEqual(histoies[1].date,"2020/12/05")
    assert.strictEqual(histoies[2].amount,1000)
    assert.strictEqual(histoies[2].date,"2020/12/10")
  }
  {
    const dataRef = (await admin.firestore().collection("balance")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const balance = dataRef.data()
    assert.strictEqual(balance.data[context.item1.id], 1000)
    assert.strictEqual(balance.data[context.item2.id], -1000)
  }
  {
    const dataRef = (await admin.firestore().collection("ledger")
      .doc(`${context.user.uid}.2020.12`).get())
    assert.strictEqual(dataRef.exists, true)
    const ledger = dataRef.data()
    assert.strictEqual(ledger.data[context.item1.id], 1000)
    assert.strictEqual(ledger.data[context.item2.id], -1000)
  }
}