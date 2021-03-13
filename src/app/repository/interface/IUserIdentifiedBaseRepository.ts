import { IUserIdentifiable, DUserIdentifiable } from "@/app/model/interface/Identifiable";
import IBaseRepository from "./IBaseRepository";
import Strable from "@/app/model/interface/common/Strable";

export default interface IUserIdentifiedBaseRepository<
  S extends Strable & DUserIdentifiable,
  T extends IUserIdentifiable
> extends IBaseRepository<S, T> {

  update: (value: T) => Promise<T>;

  // batchUpdate: (values: T[]) => Promise<T[]>;

  insert: (value: T) => Promise<T>;

  // batchInsert: (values: T[]) => Promise<T[]>;

  delete: (value: T) => Promise<void>;
}
