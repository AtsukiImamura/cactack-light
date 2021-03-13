import {
  IUserCategoryItem,
} from "@/app/model/interface/ICategory";
import UserCategory from "@/app/model/UserCategory";
import UserCategoryFlyweight from "@/app/repository/flyweight/UserCategoryFlyweight";
import { container } from "tsyringe";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import UserAuthService from "@/app/service/UserAuthService";
import AccountLedger, { ILedgerItem } from "@/app/model/virtual/AccountLedger"
import LedgerFirestore from "@/app/repository/firestore/LedgerFirestore";
import AccountType from "../AccountType";

export default class LedgerFactory {
  
  public static async loadLedgers(year: number, month: number): Promise<AccountLedger[]> {
    const userId = container.resolve(UserAuthService).userId

    if(!userId) return []

    const ledgerId = `${userId}.${year}.${month < 10 ? "0" : ""}${month}`
    const ledger = await container.resolve(LedgerFirestore).getById(ledgerId)
    
    if(!ledger)  return []

    const ledgerMap: Map<
      /* 第2レイヤのID */ string,
      /* 勘定元帳 */ {[itemId: string]: {item: IUserCategoryItem, amount: number}} // {item: , amount: number}[]
    > = container.resolve(UserCategoryItemFlyweight).getAll().reduce((acc, cur) => {
      if(!acc.has(cur.parent.id)){
        acc.set(cur.parent.id, {})
      }
      for (const tag of cur.tags) {
        const tagCategoryId = `&tag&${tag.id}`
        if (!acc.has(tag.id)) {
          acc.set(tagCategoryId, {});
        }
        acc.get(tagCategoryId)![cur.id] = {item: cur, amount: 0}
      }
      acc.get(cur.parent.id)![cur.id] = {item: cur, amount: 0}
      return acc
    }, new Map<
    /* 第2レイヤのID */ string,
    /* 勘定元帳 */  {[itemId: string]: {item: IUserCategoryItem, amount: number}}>())
    
    for(const itemId of Object.keys(ledger.data)){
      const item = container.resolve(UserCategoryItemFlyweight).get(itemId)
      if(!item){
        console.warn(`LedgerFactory >>> item not found! : ${itemId}`)
        continue
      }

      const amount = ledger.data[itemId] * (item.type.isCredit ? 1 : -1)
      const categoryId = item.parent.id;
      ledgerMap.get(categoryId)![item.id] = {item: item, amount: amount}

      for (const tag of item.tags) {
        const tagCategoryId = `&tag&${tag.id}`
        // const tagItem = container.resolve()
        ledgerMap.get(tagCategoryId)![item.id] = {item: item, amount:amount}
      }
    }

    const ledgers: AccountLedger[] = []
    for(const categoryId of ledgerMap.keys()){
      const children = Array.from(Object.values(ledgerMap.get(categoryId)!))
      const category = container.resolve(UserCategoryFlyweight).get(categoryId)
      if(!category){
        console.warn(`LedgerFactory >>> category not found.: ${categoryId}`)
        continue
      }
      const ledger = new AccountLedger(category as ILedgerItem, children!.reduce((acc, cur) => acc += cur.amount, 0), children!.map(d => new AccountLedger(d.item as ILedgerItem, d.amount)))
      ledgers.push(ledger)
      if(ledger.type.code == AccountType.TYPE_OTHER){
        LedgerFactory.prepareTagCategory(ledger)
       }
    }
    return ledgers
  }

  public static prepareTagCategory(ledger: AccountLedger): void {
    const userId = container.resolve(UserAuthService).userId;
    if (!userId) {
      throw new Error("user not found!");
    }
    const category = new UserCategory(ledger.id, "", ledger.name, AccountType.TYPE_OTHER, undefined)
    ledger.children.forEach(item => category.addItem(item.name))
    container
      .resolve(UserCategoryFlyweight)
      .insertVirtual(category);
  }
}
