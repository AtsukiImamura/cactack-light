import { singleton, container } from "tsyringe";
import StabRepositoryBase from "@/app/repository/stab/StabRepositoryBase";
import UserCreationMasterTransformer from "@/app/repository/transformer/UserCreationMasterTransformer";
import IUserCreationMasterRepository from "@/app/repository/interface/IUserCreationMasterRepository";
import IUserCreationMaster from "@/app/model/interface/IUserCreationMaster";
import DUserCreationMaster from "@/app/model/interface/DUserCreationMaster";

@singleton()
export default class StabUserCreationMasterRepository
  extends StabRepositoryBase<DUserCreationMaster, IUserCreationMaster>
  implements IUserCreationMasterRepository {
  constructor() {
    super();
    this.dbKey = "userCreationMaster";
  }

  public async aggregate(
    journal: DUserCreationMaster
  ): Promise<IUserCreationMaster> {
    return container.resolve(UserCreationMasterTransformer).aggregate(journal);
  }

  public async getByUserCreationMasterId(
    uid: string
  ): Promise<IUserCreationMaster | undefined> {
    return undefined;
  }
}
