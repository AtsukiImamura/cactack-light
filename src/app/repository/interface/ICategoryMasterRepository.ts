import IBaseRepository from "@/app/repository/interface/IBaseRepository";
import {
  ICategoryMaster,
  IAccountCategory,
  DCategoryMaster,
} from "@/app/model/interface/ICategory";

export default interface ICategoryMasterRepository
  extends IBaseRepository<DCategoryMaster, ICategoryMaster> {
  getByIdWithoutItems: (id: string) => Promise<IAccountCategory | undefined>;
}
