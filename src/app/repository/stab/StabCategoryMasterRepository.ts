import { singleton, container } from "tsyringe";
import StabRepositoryBase from "@/app/repository/stab/StabRepositoryBase";
import IUser from "@/app/model/interface/IUser";
import ICategoryMasterRepository from "../interface/ICategoryMasterRepository";
import { ICategoryMaster, DCategoryMaster } from "@/app/model/interface/ICategory";
import CategoryMasterTransaformer from "../transformer/CategoryMasterTransaformer";
import JsonUtil from "../util/JsonUtil";
import CategoryMaster from "@/app/model/CategoryMaster";

@singleton()
export default class StabCategoryMasterRepository
  extends StabRepositoryBase<DCategoryMaster, ICategoryMaster>
  implements ICategoryMasterRepository {
  constructor() {
    super();
    this.dbKey = "categoryMaster";
  }

  public async aggregate(master: DCategoryMaster): Promise<ICategoryMaster> {
    return container.resolve(CategoryMasterTransaformer).aggregate(master);
  }

  public async getByIdWithoutItems(
    id: string
  ): Promise<ICategoryMaster | undefined> {
    const docs = (await JsonUtil.read(this.dbKey)) as DCategoryMaster[];
    for (const doc of docs) {
      if (doc.id !== id) {
        continue;
      }
      return new CategoryMaster(doc.id, doc.name, doc.type, []);
    }
    return undefined;
  }

  public async getByUserId(uid: string): Promise<IUser | undefined> {
    return undefined;
  }
}
