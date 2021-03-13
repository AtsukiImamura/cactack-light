import Transformer from "@/app/repository/transformer/Transformer";

import { singleton } from "tsyringe";
import DDepreciation from "@/app/model/interface/DDepreciation";
import IDepreciation from "@/app/model/interface/IDepreciation";
import Depreciation from "@/app/model/Depreciation";

@singleton()
export default class DepreciationTransformer extends Transformer<
  DDepreciation,
  IDepreciation
> {
  public async aggregate(dep: DDepreciation): Promise<IDepreciation> {
    return Depreciation.parse(dep)
  }
}
