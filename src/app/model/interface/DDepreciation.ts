import Strable from "./common/Strable";
import { DUserIdentifiable } from "./Identifiable";

export default interface DDepreciation extends DUserIdentifiable, Strable{
    journalIds: string[],

    // firstAmount: number,

    // type: number,


}