import IUserIdentifiedBaseRepository from "./IUserIdentifiedBaseRepository";
import DBadget from "@/app/model/interface/DBadget";
import IBadget from "@/app/model/interface/IBadget";

export default interface IBadgetSettingRepository
  extends IUserIdentifiedBaseRepository<DBadget, IBadget> {}
