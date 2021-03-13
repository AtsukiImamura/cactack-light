import IJournalDate from "@/app/model/interface/IJournalDate";
import Identifiable from "@/app/model/interface/Identifiable";
import Treatable from "@/app/model/interface/common/Treatable";
import DUser from "@/app/model/interface/DUser";

export default interface IUser extends Identifiable, Treatable<DUser> {
  /** ユーザー名 */
  name: string;

  registeredAt: IJournalDate;

  introTopFinished: boolean;

  introFlowFinished: boolean;

  introBadgetFinished: boolean;

  introStoreFinished: boolean;

  isDeleted: boolean;

  setDeleted: () => void;
}
