import { DUserIdentifiable } from "./Identifiable";

export default interface DHistory extends DUserIdentifiable {
    itemId: string

    date: string

    amount: number

    diff: number
}