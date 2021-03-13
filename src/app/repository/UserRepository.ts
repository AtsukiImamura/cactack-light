import { singleton, container } from "tsyringe";
import RepositoryBase from "@/app/repository/RepositoryBase";
import UserTransformer from "@/app/repository/transformer/UserTransformer";
import IUserRepository from "@/app/repository/interface/IUserRepository";
import IUser from "@/app/model/interface/IUser";
import DUser from "@/app/model/interface/DUser";

@singleton()
export default class UserRepository extends RepositoryBase<DUser, IUser>
  implements IUserRepository {
  constructor() {
    super();
    this.dbKey = "users";
  }

  public async aggregate(journal: DUser): Promise<IUser> {
    return container.resolve(UserTransformer).aggregate(journal);
  }

  public async getByUserId(uid: string): Promise<IUser | undefined> {
    return container.resolve<IUserRepository>("UserRepository").getById(uid);
  }
}
