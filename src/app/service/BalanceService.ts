import { container } from "tsyringe";
import IJournalDate from "../model/interface/IJournalDate";
import { IBalanceItem } from "@/app/model/interface/IBalance"
import BalanceFirestore from "@/app/repository/firestore/BalanceFirestore";
import UserCategoryItemFlyweight from "../repository/flyweight/UserCategoryItemFlyweight";
import UserAuthService from "./UserAuthService";

export async function loadBalances(date: IJournalDate) {
    const userId = container.resolve(UserAuthService).userId
    if(!userId){
      return []
    }
    const year = date.firstDayOfUser.year
    const month = date.firstDayOfUser.month
    const balances = await container.resolve(BalanceFirestore).search(cl => 
            cl
              .where("dateKey", "<=", `${year}.${month < 10 ? "0":""}${month}`)  
              .orderBy("dateKey", "desc")
              .limit(1)
    )

    if(balances.length === 0){
      return []
    }

    const balance = balances[0]

    const itemMap = new Map<string, IBalanceItem>()
    for(const itemId of Object.keys(balance.data)){
      const item = container.resolve(UserCategoryItemFlyweight).get(itemId)

      if(!item){
        // console.warn(`loadBalances >>> item ${itemId} not found.`)
        continue;
      }
      if(!itemMap.has(item.parent.id)){
        itemMap.set(item.parent.id, { item: item.parent, amount: 0, children: []})
      }
      const amount = (item.type.isCredit ? 1 : -1) *(balance.data[itemId])// + ((historyMap.has(itemId) ? historyMap.get(itemId)! : 0)))
      itemMap.get(item.parent.id)!.amount +=  amount
      itemMap.get(item.parent.id)!.children!.push({item: item, amount: amount})
    }
    return Array.from(itemMap.values()).filter(b => b.item.type.isReal)
  }