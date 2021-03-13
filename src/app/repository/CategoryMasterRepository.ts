import { singleton, container } from "tsyringe";
import RepositoryBase from "@/app/repository/RepositoryBase";
import {
  DCategoryMaster,
  ICategoryMaster,
} from "@/app/model/interface/ICategory";
import ICategoryMasterRepository from "./interface/ICategoryMasterRepository";
import CategoryMasterTransaformer from "./transformer/CategoryMasterTransaformer";
import CategoryMaster from "@/app/model/CategoryMaster";

@singleton()
export default class CategoryMasterRepository
  extends RepositoryBase<DCategoryMaster, ICategoryMaster>
  implements ICategoryMasterRepository {
  constructor() {
    super();
    this.dbKey = "categoryMaster";
  }

  public async aggregate(item: DCategoryMaster): Promise<ICategoryMaster> {
    return container.resolve(CategoryMasterTransaformer).aggregate(item);
  }

  public async getByIdWithoutItems(
    id: string
  ): Promise<ICategoryMaster | undefined> {
    return this.ref()
      .doc(id)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return undefined;
        }
        const data = doc.data() as DCategoryMaster;
        data.id = doc.id;
        return new CategoryMaster(doc.id, data.name, data.type, []);
      });
  }
}
