import admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as journals from "@/app/function/components/journal"


try {
  admin.initializeApp();
} catch (e) {
  console.log("app initiation error: ", e);
}


export const onJournalUpdated = functions.firestore
              .document("journals/{docId}")
              .onUpdate(journals.trigger.onJournalUpdated)

export const onJournalCreated = functions.firestore
              .document("journals/{docId}")
              .onCreate(journals.trigger.onJournalCreated)

// export const getBookContext = functions.region("us-central1").https.onRequest(
//   context.auth.CallableFunction.auth()
//     .check((context) => !!context.params.from)
//     .check((context) => !!context.params.to)
//     .execute((context) => JournalData.getBookContext(context))
// );
