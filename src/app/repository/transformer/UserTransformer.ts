import Transformer from "@/app/repository/transformer/Transformer";
import IUser from "@/app/model/interface/IUser";
import DUser from "@/app/model/interface/DUser";
import User from "@/app/model/User";
import JournalDate from "@/app/model/common/JournalDate";

export default class UserDetailTransformer extends Transformer<DUser, IUser> {
  public async aggregate(user: DUser): Promise<IUser> {
    return Promise.resolve().then(() => {
      return new User(
        user.name,
        user.id,
        JournalDate.cast(user.registeredAt),
        user.introTopFinished,
        user.introFlowFinished,
        user.introBadgetFinished,
        user.introStoreFinished
      );
    });
  }
}
