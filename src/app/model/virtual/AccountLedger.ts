import { IUserCategory, IUserCategoryItem } from "@/app/model/interface/ICategory";
import IJournalDate from "@/app/model/interface/IJournalDate";
import LedgerCategory from "./LedgerCategory";
import IJournal from "@/app/model/interface/IJournal";
import IAccountType from "../interface/IType";

export interface ILedgerDetail {
  category: LedgerCategory;

  amount: number;

  accountAt: IJournalDate;

  origin?: IJournal;
}

export type ILedgerItem =  IUserCategory & IUserCategoryItem

export default class AccountLedger {

  /**
   * Getter children
   * @return {AccountLedger[] }
   */
  public get children(): AccountLedger[] {
    return this._children
  }

  public get name(): string {
    return this.item.name
  }

  public get item(): ILedgerItem {
    return this._item;
  }

  public get id(): string {
    return this._item.id
  }

  public get amount(): number {
    return this._amount
  }

  public get type(): IAccountType {
    return this.item.type
  }
  private _item: ILedgerItem;

  private _amount: number;

  private _children: AccountLedger[] = [];

  // private 

  constructor(
    item: ILedgerItem,
    amount: number,
    children?: AccountLedger[],
  ) {
    this._item = item
    this._amount = amount
    if (children) {
      this._children.push(...children)
    }
  }
}
