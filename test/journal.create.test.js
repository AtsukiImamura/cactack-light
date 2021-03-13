const admin = require("firebase-admin");
const fs = require("fs");
const journalUtil = require("./util/JournalUtil.mjs")

let user = null
const categoryItems = []
let app = null;

(async () => {
    const sleepMe = (msec) => new Promise((o, x) => setTimeout(o,msec))
    console.log("start!")
    // preparation

    const credential = fs.readFileSync(
        __dirname + "\\..\\credentials\\cactack-light-firestore-credential.json"
      ).toString()
      app = admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(credential)),
          databaseURL: "https://cactack-26e4c.firebaseio.com",
          projectId: "cactack-light"
      });
    
      user = await admin.auth().createUser({})
    
      console.log("preparing items...")
      for(let itemCnt = 0; itemCnt < 15; itemCnt ++){
        const item = {
          id: "",
          name: `test-item-${itemCnt + 1}`,
          userId: user.uid
        }
        await app.firestore().collection("userCategoryItem")
          .add(item).then(doc => {
            item.id = doc.id
            categoryItems.push(item)
          })
      }


    /**
     * --------------------------------------------------------------------------------------
     * ## test ##
     * 仕訳作成時に履歴が作成されること
     * 
     * --------------------------------------------------------------------------------------
     */
    console.log("[1] start")
    await (async () => {
        
        const item1 = categoryItems[0]
        const item2 = categoryItems[1]
  
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 200)
                            .debit( item2.id, 200)
                            .build()
            )
        await sleepMe(2500)
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item1.id)
            .get()).docs.map(doc => doc.data())
          strictEqual(histoies.length, 1)
          strictEqual(histoies[0].amount, 200)
        }
  
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item2.id)
            .get()).docs.map(doc => doc.data())
          strictEqual(histoies.length, 1)
          strictEqual(histoies[0].amount, -200)
        }
    })()
    console.log("=>  OK")

    /**
     * --------------------------------------------------------------------------------------
     * ## test ##
     * 既存の仕訳の過去に仕訳を作成した際に、既存の履歴が正しく更新されること
     * 
     * --------------------------------------------------------------------------------------
     */
    console.log("[2] start")
    await (async () => {
        const item1 = categoryItems[2]
        const item2 = categoryItems[3]
        
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 200)
                            .debit( item2.id, 200)
                            .build()
            )
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/11/20")
                            .userId(user.uid)
                            .credit(item1.id, 300)
                            .debit( item2.id, 300)
                            .build()
            )
  
        await sleepMe(4000)
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item1.id)
            .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
          strictEqual(histoies.length,2)
          strictEqual(histoies[0].amount,300)
          strictEqual(histoies[0].date,"2020/11/20")
          strictEqual(histoies[1].amount,500)
          strictEqual(histoies[1].date,"2020/12/01")
        }
    })()
    console.log("[2] OK")

    /**
     * --------------------------------------------------------------------------------------
     * ## test ##
     * 既存の仕訳よりも後の作成日で作成した場合に、
     * 　・既存の履歴に変更がないこと
     * 　・新しい履歴が作成されること
     * 
     * --------------------------------------------------------------------------------------
     */
    console.log("[3] start")
    await (async () => {
        const item1 = categoryItems[4]
        const item2 = categoryItems[5]
        
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 200)
                            .debit( item2.id, 200)
                            .build()
            )
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/10")
                            .userId(user.uid)
                            .credit(item1.id, 300)
                            .debit( item2.id, 300)
                            .build()
            )
  
        await sleepMe(4000)
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item1.id)
            .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
          strictEqual(histoies.length,2)
          strictEqual(histoies[0].amount,200)
          strictEqual(histoies[0].date,"2020/12/01")
          strictEqual(histoies[1].amount,500)
          strictEqual(histoies[1].date,"2020/12/10")
        }
    })()
    console.log("[3] OK")

    /**
     * --------------------------------------------------------------------------------------
     * ## test ##
     * 既存の仕訳が複数ある場合で、2つの仕訳の作成日時の間で作成した場合、
     * 　・既存の仕訳で作成日が早いものの履歴は更新されないこと
     * 　・作成した仕訳分の履歴が作成されること
     * 　・既存の仕訳で作成日が遅いものは当たらに作成した仕訳の分で更新されること
     * --------------------------------------------------------------------------------------
     */
    console.log("[4] start")
    await (async () => {
        const item1 = categoryItems[6]
        const item2 = categoryItems[7]
        const item3 = categoryItems[8]
        
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 200)
                            .debit( item2.id, 200)
                            .build()
            )
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/10")
                            .userId(user.uid)
                            .credit(item1.id, 300)
                            .debit( item2.id, 300)
                            .build()
            )
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/05")
                            .userId(user.uid)
                            .credit(item1.id, 400)
                            .debit( item2.id, 400)
                            .build()
            )
  
        await sleepMe(4000)
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item1.id)
            .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
          strictEqual(histoies.length,3)
          strictEqual(histoies[0].amount,200)
          strictEqual(histoies[0].date,"2020/12/01")
          strictEqual(histoies[1].amount,600)
          strictEqual(histoies[1].date,"2020/12/05")
          strictEqual(histoies[2].amount,900)
          strictEqual(histoies[2].date,"2020/12/10")
        }
    })()
    console.log("[4] OK")

    console.log("[5] start")
    await (async () => {
        const item1 = categoryItems[9]
        const item2 = categoryItems[10]
        
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 200)
                            .debit( item2.id, 200)
                            .build()
            )
        await app.firestore().collection("journals")
            .add(journalUtil.builder()
                            .accountAt("2020/12/01")
                            .userId(user.uid)
                            .credit(item1.id, 300)
                            .debit( item2.id, 300)
                            .build()
            )
  
        await sleepMe(4000)
        {
          const histoies = (await app.firestore().collection("history")
            .where("userId", "==", user.uid)
            .where("itemId", "==", item1.id)
            .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
          strictEqual(histoies.length,1)
          strictEqual(histoies[0].amount,500)
          strictEqual(histoies[0].date,"2020/12/01")
        }
    })()
    console.log("[5] OK")

})()
.then(() => {

})
.catch(err => console.error(err))
.finally(async () => {
    for(const cName of ["userCategoryItem", "history", "journals"]) {
        await app.firestore().collection(cName)
            .where("userId", "=", user.uid)
            .get()
            .then(res => {
                const list = res.docs.map(doc => {
                    const d = doc.data()
                    d.id = doc.id
                    return d
                })
                console.log(`${cName}: ${list.length}`)
                // console.log(list)
                return Promise.all(list.map(d => app.firestore().collection(cName).doc(d.id).delete()))
            })
            .then(() => console.log(`OK: ${cName}`))
    }

    process.exit(0)
})

function strictEqual(actual, expected) {
    if(actual !== expected) {
        throw Error(`${expected} is expected, but got ${actual}`)
    }
}