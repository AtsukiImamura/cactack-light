import IBaseRepository from "@/app/repository/interface/IBaseRepository";
import {
  ICategoryItemMaster,
  DCategoryItemMaster,
} from "@/app/model/interface/ICategory";

export default interface ICategoryItemMasterRepository
  extends IBaseRepository<DCategoryItemMaster, ICategoryItemMaster> {
  getByParentId: (parentId: string) => Promise<ICategoryItemMaster[]>;
}
