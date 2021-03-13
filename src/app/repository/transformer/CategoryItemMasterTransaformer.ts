import Transformer from "@/app/repository/transformer/Transformer";
import {
  DCategoryItemMaster,
  ICategoryItemMaster,
  ICategoryMaster,
} from "@/app/model/interface/ICategory";
import { container } from "tsyringe";
import ICategoryMasterRepository from "@/app/repository/interface/ICategoryMasterRepository";
import AccountType from "@/app/model/AccountType";

export default class CategoryItemMasterTransaformer extends Transformer<
  DCategoryItemMaster,
  ICategoryItemMaster
> {
  public async aggregate(
    item: DCategoryItemMaster
  ): Promise<ICategoryItemMaster> {
    const categoryData = await container
      .resolve<ICategoryMasterRepository>("CategoryMasterRepository")
      .getData(item.parentId);
    if (!categoryData) {
      throw new Error("parent not found.");
    }
    return ({
      id: item.id,
      parent: ({
        id: categoryData.id,
        name: categoryData.name,
        type: new AccountType(categoryData.type),
        items: [],
      } as any) as ICategoryMaster,
      name: item.name,
      type: new AccountType(categoryData.type),
    } as any) as ICategoryItemMaster;
  }
}
