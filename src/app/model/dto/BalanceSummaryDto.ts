import { ICategoryItem, IAccountCategory } from "@/app/model/interface/ICategory";

export interface BalanceSummaryDto {
  item: ICategoryItem | IAccountCategory;

  amount: number;

  children?: BalanceSummaryDto[];
}
