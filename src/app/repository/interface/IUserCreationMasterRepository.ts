import IBaseRepository from "@/app/repository/interface/IBaseRepository";
import IUserCreationMaster from "@/app/model/interface/IUserCreationMaster";
import DUserCreationMaster from "@/app/model/interface/DUserCreationMaster";

export default interface IUserCreationMasterRepository
  extends IBaseRepository<DUserCreationMaster, IUserCreationMaster> {}
