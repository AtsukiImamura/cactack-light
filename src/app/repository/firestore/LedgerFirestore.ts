import DLedger from "@/app/model/interface/DLedger";
import UserAuthService from "@/app/service/UserAuthService";
import { container } from "tsyringe";
import FirestoreServiceBase from "./FirestoreServiceBase";

export default class LedgerFirestore extends FirestoreServiceBase<DLedger> {

    constructor(){
        super("ledger")
    }

    public async getByMonth(year: number, month: number) {
        const userId = container.resolve(UserAuthService).userId
        if(!userId){
            throw new Error("user nod found.")
        }
        const key = `${userId}.${year}.${month < 10 ? "0" : ""}${month}`
        return await this.getById(key)
    }
}