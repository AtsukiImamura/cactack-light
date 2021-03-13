import { DUserIdentifiable } from "@/app/model/interface/Identifiable";

export default interface DBalance extends DUserIdentifiable{
    data: {[itemId: string]: number }

    dateKey: string,

    year: number,

    month: number
}