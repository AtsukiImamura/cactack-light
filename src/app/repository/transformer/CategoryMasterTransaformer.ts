import Transformer from "@/app/repository/transformer/Transformer";
import { DCategoryMaster, ICategoryMaster } from "@/app/model/interface/ICategory";
import { container } from "tsyringe";
import ICategoryItemMasterRepository from "@/app/repository/interface/ICategoryItemMasterRepository";
import AccountType from "@/app/model/AccountType";

export default class CategoryMasterTransaformer extends Transformer<
  DCategoryMaster,
  ICategoryMaster
> {
  public async aggregate(category: DCategoryMaster): Promise<ICategoryMaster> {
    const master: ICategoryMaster = ({
      id: category.id,
      name: category.name,
      type: new AccountType(category.type),
      items: [],
    } as any) as ICategoryMaster;
    const items = (
      await container
        .resolve<ICategoryItemMasterRepository>("CategoryItemMasterRepository")
        .getByParentId(category.id)
    ).map((item) => {
      item.parent = master;
      return item;
    });

    master.items = items;
    return master;
  }
}
