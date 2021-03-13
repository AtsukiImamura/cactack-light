import Transformer from "@/app/repository/transformer/Transformer";

import { singleton } from "tsyringe";
import DBadgetSetting from "@/app/model/interface/DBadget";
import IBadgetSetting from "@/app/model/interface/IBadget";
import BadgetSetting from "@/app/model/BadgetSetting";

@singleton()
export default class BadgetSettingTransformer extends Transformer<
  DBadgetSetting,
  IBadgetSetting
> {
  public async aggregate(badget: DBadgetSetting): Promise<IBadgetSetting> {
    return BadgetSetting.parse(badget);
  }
}
