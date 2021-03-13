import DHistory from "@/app/model/interface/DHistory";
import FirestoreServiceBase from "./FirestoreServiceBase";

export default class HistoryFirestore extends FirestoreServiceBase<DHistory> {

    constructor(){
        super("history")
    }
}