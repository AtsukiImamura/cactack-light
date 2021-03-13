
import admin from "firebase-admin";
import * as JournalUtil from "../../util/JournalUtil.mjs"
import * as assert from "../../util/assert.mjs"
import * as commonUtil from "../../util/common.mjs"

const TEST_NAME = "journal__update_test_N"

/**
 * --------------------------------------------------------------------------------------
 * ## test ##
 * comment here
 * --------------------------------------------------------------------------------------
 */
export async function test(context) {

    const categoryItems = await commonUtil.prepareItems(context.user.uid, 2, TEST_NAME)

    const item1 = categoryItems[0]
    const item2 = categoryItems[1]

    // await admin.firestore().collection("journals")
    // .add(JournalUtil.builder()
    //                 .accountAt("2020/12/01")
    //                 .userId(context.user.uid)
    //                 .credit(item1.id, 200)
    //                 .debit( item2.id, 200)
    //                 .build()
    // )
    // await commonUtil.sleepMe(2000)
    
    return {
      user: context.user,
      item1: item1
    }
}


export async function result(context) {
  {
    // const histoies = (await admin.firestore().collection("history")
    //   .where("userId", "==", context.user.uid)
    //   .where("itemId", "==", context.item1.id)
    //   .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
    // assert.strictEqual(histoies.length,1)
    // assert.strictEqual(histoies[0].amount,700)
    // assert.strictEqual(histoies[0].date,"2020/12/01")
  }
}