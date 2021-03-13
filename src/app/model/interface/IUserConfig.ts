import { IUserIdentifiable , DUserIdentifiable} from "./Identifiable";
import Treatable from "./common/Treatable";
import Strable from "./common/Strable";

export interface IUserConfigBase  {
  key: string;

  value: number | string;
}

export interface DUserConfig extends IUserConfigBase, DUserIdentifiable, Strable {}

export interface IUserConfig extends IUserConfigBase, IUserIdentifiable, Treatable<DUserConfig> {}

export enum UserConfigKey {
  BALANCE_DEBIT_CORRECTION_ITEM_ID = "BALANCE_DEBIT_CORRECTION_ITEM_ID",

  BALANCE_CREDIT_CORRECTION_ITEM_ID = "BALANCE_CREDIT_CORRECTION_ITEM_ID",

  // BALANCE_DEBIT_CORRECTION_ITEM_ID = "BALANCE_DEBIT_CORRECTION_ITEM_ID",

  ENABLE_MONTHLY_DISP = "ENABLE_MONTHLY_DISP",

  FIRST_DAY_OF_MONTH = "FIRST_DAY_OF_MONTH",

  INCLUDE_FIRST_DAY_TO_NEXT_MONTH = "INCLUDE_FIRST_DAY_TO_NEXT_MONTH",
}
