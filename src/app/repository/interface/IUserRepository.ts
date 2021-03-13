import IBaseRepository from "@/app/repository/interface/IBaseRepository";
import IUser from "@/app/model/interface/IUser";
import DUser from "@/app/model/interface/DUser";

export default interface IUserRepository extends IBaseRepository<DUser, IUser> {
  getByUserId: (uid: string) => Promise<IUser | undefined>;
}
