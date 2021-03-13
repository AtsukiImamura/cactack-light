import { singleton, container } from "tsyringe";
import UserIdentifiedRepositoryBase from "./UserIdentifiedRepositoryBase";
import DDepreciation from "../model/interface/DDepreciation";
import IDepreciation from "../model/interface/IDepreciation";
import IDepreciationRepository from "./interface/IDepreciationRepository";
import DepreciationTransformer from "./transformer/DepreciationTransformer";

@singleton()
export default class DepreciationRepository
  extends UserIdentifiedRepositoryBase<DDepreciation, IDepreciation>
  implements IDepreciationRepository {
  constructor() {
    super();
    this.dbKey = "depreciation";
  }

  public async aggregate(dep: DDepreciation): Promise<IDepreciation> {
    return container.resolve(DepreciationTransformer).aggregate(dep);
  }
}
