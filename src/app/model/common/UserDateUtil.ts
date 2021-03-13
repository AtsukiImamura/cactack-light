
import { DateConfig } from "@/app/function/model/date/DateConfig";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";


import JournalDate from "../../function/model/date/JournalDate";

export function minOf(d1: string, d2: string) {
    const dt1 = JournalDate.cast(d1);
    const dt2 = JournalDate.cast(d2);
    return dt1.beforeThan(dt2) ? dt1 : dt2;
}

export function maxOf(d1: string, d2: string) {
    const dt1 = JournalDate.cast(d1);
    const dt2 = JournalDate.cast(d2);
    return dt1.afterThan(dt2) ? dt1 : dt2;
}


export async function loadConfig(userId: string) {
    // console.log("UserDateConfig: loadConfig: userId="+userId)
    const userConfigMap = (await firebase.firestore().collection("userConfig")
        .where("userId", "==", userId)
        .get()
    ).docs.map(doc => doc.data() as {key: string, value: number | string}).reduce((acc, cur) => {
        (acc as any)[cur.key] = cur.value
        return acc
    }, {})
    return new DateConfig(userConfigMap);
}