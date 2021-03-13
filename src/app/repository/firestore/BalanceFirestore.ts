import DBalance from "@/app/model/interface/DBalance";
import FirestoreServiceBase from "./FirestoreServiceBase";

export default class BalanceFirestore extends FirestoreServiceBase<DBalance> {

    constructor(){
        super("balance")
    }
}