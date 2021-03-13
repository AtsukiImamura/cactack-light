import admin from "firebase-admin";
import * as  fs from "fs";
// import * as JournalUtil from "./util/JournalUtil.js"
import * as commonUtil from "./util/common.mjs"

import * as journal__update_1 from "./journal/udpate/test1.mjs"
import * as journal__update_2 from "./journal/udpate/test2.mjs"
import * as journal__update_3 from "./journal/udpate/test3.mjs"
import * as journal__update_4 from "./journal/udpate/test4.mjs"
import * as journal__update_5 from "./journal/udpate/test5.mjs"
import * as journal__update_6 from "./journal/udpate/test6.mjs"
import * as journal__update_7 from "./journal/udpate/test7.mjs"
import cliProgress from "cli-progress";

let user = null


const progressBar = new cliProgress.MultiBar(
    {
        format: "[{bar}] | {task} | {percentage}% | ETA: {eta}s | {value}/{total}",
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
    },
    cliProgress.Presets.shades_grey
);

(async () => {

    const pathTokens = process.argv[1].split("\\")
    const credential = fs.readFileSync(
    pathTokens.slice(0,-1).join("\\") + "\\..\\credentials\\cactack-light-firestore-credential.json"
    ).toString()
    const app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(credential)),
        databaseURL: "https://cactack-26e4c.firebaseio.com",
        projectId: "cactack-light"
    });    
    user = await admin.auth().createUser({})
      
    const targetFunctions = [
        // journal__update_1,
        // journal__update_2,
        // journal__update_3,
        // journal__update_4,
        // journal__update_5,
        // journal__update_6,
        journal__update_7
    ]
    const resultContexts = []

    {
        const progress = progressBar.create(targetFunctions.length, 0, {task: `test`,});
        for(const testFunc of targetFunctions){
            resultContexts.push({
                context: await testFunc.test({user: user}),
                resultFunc: testFunc.result
            })
            progress.increment()
        }
        // await Promise.all(targetFunctions.map(async testFunc => resultContexts.push({
        //     context: await testFunc.test({user: user}).then(rctx => {progress.increment(); return rctx}),
        //     resultFunc: testFunc.result
        // })))
    }
    await commonUtil.sleepMe( Math.max(Math.min(12000, 18000 - targetFunctions.length *2000),0), true)

    {
        const progress = progressBar.create(targetFunctions.length, 0, {task: `result`,});
        for(const rctx of resultContexts){
            await commonUtil.sleepMe(2000, false)
            try {
                await rctx.resultFunc(rctx.context).then(() => progress.increment())
            }catch(e){
                console.error(e)
            }
        }

    }


    // await Promise.all([
    //     journal__update_test_1({user: user}),
    //     journal__update_test_2({user: user}),
    // //     journal__update_test_3({user: user}),
    // //     journal__update_test_4({user: user}),
    // //     journal__update_test_5({user: user}),
    // ])

    // await journal__update_test_1({user: user})
    // console.log("test1: OK")
    // await journal__update_test_2({user: user})
    // console.log("test2: OK")
    // await journal__update_test_3({user: user})
    // console.log("test3: OK")
    // await journal__update_test_4({user: user})
    // console.log("test4: OK")
    // await journal__update_test_5({user: user})
    // console.log("test5: OK")


})()
.then(() => {

})
.catch(err => console.error(err))
.finally(async () => {
    // console.log(`delete item of user ${user.uid}`)
    for(const cName of ["userCategoryItem", "history", "journals"]) {
        await admin.firestore().collection(cName)
            .where("userId", "==", user.uid)
            .get()
            .then(res => {
                const list = res.docs.map(doc => {
                    const d = doc.data()
                    d.id = doc.id
                    return d
                })
                return Promise.all(list.map(d => admin.firestore().collection(cName).doc(d.id).delete()))
            })
    }
    await admin.auth().deleteUser(user.uid)
    progressBar.stop()
    process.exit(0)
})