import ILogicalDeletable, { DLogicalDeletable } from "./common/LogicalDeletable";

export default interface Identifiable {
  id: string;

  // TODO: 論理削除の仕組みを入れたい
  // delete: () => void;
}

export interface IUserIdentifiable extends Identifiable,ILogicalDeletable {
  userId: string;
}

export interface DUserIdentifiable extends Identifiable, DLogicalDeletable {
  userId: string;
}
