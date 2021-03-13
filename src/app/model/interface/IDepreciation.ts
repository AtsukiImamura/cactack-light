import Treatable from "./common/Treatable";
import DDepreciation from "./DDepreciation";
import { IUserIdentifiable } from "./Identifiable";
import IJournal from "./IJournal";

export default interface IDepreciation extends IUserIdentifiable, Treatable<DDepreciation> {

    loadJournals: () => Promise<IJournal[]>
}