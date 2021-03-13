import Identifiable, { DUserIdentifiable } from "./Identifiable";
import Strable from "./common/Strable";

export default interface DBadgetSetting
  extends Identifiable,
    Strable,
    DUserIdentifiable {
  title: string;

  amount: number;

  itemId: string;

  unit: number;

  managementUnit: number;

  badgets: DBadget[];
}

export interface DBadget {
  year: number;

  month: number;

  expectedAmount: number;
}
