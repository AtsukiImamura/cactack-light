import {
  IUserCategoryItem,
  DUserCategoryItem,
} from "@/app/model/interface/ICategory";
import IUserIdentifiedBaseRepository from "./IUserIdentifiedBaseRepository";

export default interface IUserCategoryItemRepository
  extends IUserIdentifiedBaseRepository<DUserCategoryItem, IUserCategoryItem> {}
