import { IAccountCategory, ICategoryItem } from "./ICategory";

export interface IBalanceItem {
  item: IAccountCategory | ICategoryItem;

  amount: number;

  children?: IBalanceItem[];
}