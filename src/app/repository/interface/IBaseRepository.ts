import Identifiable from "@/app/model/interface/Identifiable";
import Strable from "@/app/model/interface/common/Strable";

export default interface IBaseRepository<
  S extends Strable & Identifiable,
  T extends Identifiable
> {
  getById: (id: string) => Promise<T | undefined>;

  getByIds: (ids: string[]) => Promise<T[]>;

  getData: (id: string, cache?: boolean) => Promise<S | undefined>;

  getAll: () => Promise<T[]>
}
