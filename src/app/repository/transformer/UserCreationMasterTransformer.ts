import Transformer from "@/app/repository/transformer/Transformer";
import DUserCreationMaster from "@/app/model/interface/DUserCreationMaster";
import IUserCreationMaster from "@/app/model/interface/IUserCreationMaster";
import UserCreationMaster from "@/app/model/UserCreationMaster";

export default class UserCreationMasterTransformer extends Transformer<
  DUserCreationMaster,
  IUserCreationMaster
> {
  public async aggregate(
    master: DUserCreationMaster
  ): Promise<IUserCreationMaster> {
    return Promise.resolve().then(() => {
      return new UserCreationMaster(master);
    });
  }
}
