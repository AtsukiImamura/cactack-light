import { singleton, container } from "tsyringe";
import StabRepositoryBase from "@/app/repository/stab/StabRepositoryBase";
import UserTransformer from "@/app/repository/transformer/UserTransformer";
import IUserRepository from "@/app/repository/interface/IUserRepository";
import IUser from "@/app/model/interface/IUser";
import DUser from "@/app/model/interface/DUser";

@singleton()
export default class StabUserRepository extends StabRepositoryBase<DUser, IUser>
  implements IUserRepository {
  constructor() {
    super();
    this.dbKey = "user";
  }

  public async aggregate(journal: DUser): Promise<IUser> {
    return container.resolve(UserTransformer).aggregate(journal);
  }

  public async getByUserId(uid: string): Promise<IUser | undefined> {
    return undefined;
  }
}
