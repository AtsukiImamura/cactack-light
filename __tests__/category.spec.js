const admin = require("firebase-admin");
const fs = require("fs");

let user = null
const categoryItems = []
let app = null;

// これ入れないと非同期のところで怒られる
jest.useFakeTimers().setTimeout(30000);
// const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

beforeAll(async () => {
  const credential = fs.readFileSync(
    __dirname + "\\..\\credentials\\cactack-light-firestore-credential.json"
  ).toString()
  app = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(credential)),
      databaseURL: "https://cactack-26e4c.firebaseio.com",
      projectId: "cactack-light"
  });

  user = await admin.auth().createUser({})

  for(let itemCnt = 0; itemCnt < 20; itemCnt ++){
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
});



describe("作成時の挙動テスト", () => {
  test("仕訳作成時に履歴が作成されること", async () => {

      const item1 = categoryItems[0]
      const item2 = categoryItems[1]

      console.log(" -> check1")
      await app.firestore().collection("journals")
        .add({
          accountAt: "2020/12/01",
          credits: [{
            categoryItemId: item1.id,
            amount: 200
          }],
          debits: [{
            categoryItemId: item2.id,
            amount: 200
          }],
          userId: user.uid
        })
      console.log(" -> check2")
      {
        const histoies = (await app.firestore().collection("history")
          .where("userId", "==", user.uid)
          .where("itemId", "==", item1.id)
          .get()).docs.map(doc => doc.data())
        expect(histoies.length).toBe(1)
        expect(histoies[0].amount).toBe(200)
      }
      console.log(" -> check3")

      {
        const histoies = (await app.firestore().collection("history")
          .where("userId", "==", user.uid)
          .where("itemId", "==", item2.id)
          .get()).docs.map(doc => doc.data())
        expect(histoies.length).toBe(1)
        expect(histoies[0].amount).toBe(-200)
      }
      console.log(" -> check4")
  });

  test("過去への挿入時に既存履歴が更新されること", async () => {
      const item1 = categoryItems[0]
      const item2 = categoryItems[1]
      console.log(" -> check5")
      
      await app.firestore().collection("journals")
          .add({
            accountAt: "2020/12/01",
            credits: [{
              categoryItemId: item1.id,
              amount: 200
            }],
            debits: [{
              categoryItemId: item2.id,
              amount: 200
            }],
            userId: user.uid
          })
      console.log(" -> check6")
      await app.firestore().collection("journals")
          .add({
            accountAt: "2020/11/20",
            credits: [{
              categoryItemId: item1.id,
              amount: 300
            }],
            debits: [{
              categoryItemId: item2.id,
              amount: 300
            }],
            userId: user.uid
          })
      // await sleep(1000)
      console.log(" -> check7")

      {
        const histoies = (await app.firestore().collection("history")
          .where("userId", "==", user.uid)
          .where("itemId", "==", item1.id)
          .get()).docs.map(doc => doc.data()).sort((a,b) => a.date > b.date ? 1 : -1)
        expect(histoies.length).toBe(2)
        expect(histoies[0].amount).toBe(300)
        expect(histoies[0].date).toBe("2020/11/20")
        expect(histoies[1].amount).toBe(500)
        expect(histoies[1].date).toBe("2020/12/01")
      }
      console.log(" -> check8")
  })
});

