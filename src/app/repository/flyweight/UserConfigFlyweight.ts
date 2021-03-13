import UserFlyweightBase from "./UserFlyWeightBase";
import { singleton } from "tsyringe";
import UserConfig from "@/app/model/UserConfig";
import { DUserConfig, IUserConfig } from "@/app/model/interface/IUserConfig";

@singleton()
export default class UserConfigFlyweight extends UserFlyweightBase<
  DUserConfig,
  IUserConfig
> {
  constructor() {
    super();
    this.key = "userConfig";
  }

  public getByConfigKey(key: string): IUserConfig | undefined {
    return this.values.filter((v) => v.key === key).shift();
  }

  protected aggregate(data: DUserConfig) {
    return UserConfig.parse(data);
  }
}
