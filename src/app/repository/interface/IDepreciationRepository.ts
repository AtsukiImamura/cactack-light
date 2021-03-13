import DDepreciation from "@/app/model/interface/DDepreciation";
import IDepreciation from "@/app/model/interface/IDepreciation";
import IUserIdentifiedBaseRepository from "./IUserIdentifiedBaseRepository";

export default interface IDepreciationRepository
  extends IUserIdentifiedBaseRepository<DDepreciation, IDepreciation> {
}
