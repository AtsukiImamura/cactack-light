import { DUserIdentifiable } from "@/app/model/interface/Identifiable";

export default interface DLedger extends DUserIdentifiable{
    ledgerKey: string,

    data: {[itemId: string]: number},
}