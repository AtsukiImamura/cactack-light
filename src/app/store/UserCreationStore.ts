import { VuexModule, getModule, Module, Action } from "vuex-module-decorators";
import store from ".";
import IUserCreationMaster from "@/app/model/interface/IUserCreationMaster";
import { container } from "tsyringe";
import IUserCreationMasterRepository from "@/app/repository/interface/IUserCreationMasterRepository";
import { IUserCategory, IUserCategoryItem } from "@/app/model/interface/ICategory";
import UserCategory from "@/app/model/UserCategory";
import UserAuthService from "@/app/service/UserAuthService";
import UserCreationMaster from "@/app/model/UserCreationMaster";
import UserCategoryItem from "@/app/model/UserCategoryItem";
import AccountType from "@/app/model/AccountType";
import IJournalRepository from "@/app/repository/interface/IJournalRepository";
import Journal from "@/app/model/Journal";
import JournalDetail from "@/app/model/JournalDetail";
import UserCategoryFlyweight from "@/app/repository/flyweight/UserCategoryFlyweight";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";

export interface IBalanceInfo {
  name: string;
  amount: number;
}

@Module({ dynamic: true, store, name: "badget", namespaced: true })
class UserCreationStore extends VuexModule {
  // 選択肢マスタ
  public creationMasters: IUserCreationMaster[] = [];
  // 選択されたマスタ
  public selectedCreationMasters: IUserCreationMaster[] = [];

  public userBalanceInfoMap: { [type: number]: IUserCategory } = {};

  @Action({ rawError: true })
  public async init(): Promise<void> {
    if (this.creationMasters.length > 0) {
      return;
    }
    const masters = await (container.resolve(
      "UserCreationMasterRepository"
    ) as IUserCreationMasterRepository).getAll();
    if (this.creationMasters.length > 0) {
      return;
    }
    this.creationMasters.push(...masters);
  }

  @Action({ rawError: true })
  public selectCreationMasters(masters: IUserCreationMaster[]) {
    this.selectedCreationMasters.push(...masters);
  }

  @Action({ rawError: true })
  public async commitBalance(info: { [type: number]: IBalanceInfo[] }) {
    const userId: string = container.resolve(UserAuthService).userId;
    if (!userId) {
      return;
    }

    const initIncome = await container
      .resolve(UserCategoryFlyweight)
      .insert(UserCategory.simple("初期残高", AccountType.TYPE_INCOME));
    const initDebitItem = initIncome.addItem("初期残高") as IUserCategoryItem;
    const initIncomeItem = await container
      .resolve(UserCategoryItemFlyweight)
      .insert(initDebitItem);

    const insertCategory = async (
      title: string,
      type: number,
      accountType: number
    ) => {
      const inserted = await container
        .resolve(UserCategoryFlyweight)
        .insert(UserCategory.simple(title, accountType));
      const userCategoryItems: IUserCategoryItem[] = [];
      for (const balance of info[type]) {
        const item = await container
          .resolve(UserCategoryItemFlyweight)
          .insert(UserCategoryItem.simple(inserted.id, balance.name));
        const journal = Journal.simple(
          `${item.name} 初期残高`,
          [new JournalDetail(initIncomeItem, balance.amount)],
          [new JournalDetail(item, balance.amount)]
        );
        journal.execute();
        await container
          .resolve<IJournalRepository>("JournalRepository")
          .insert(journal);
        userCategoryItems.push(item);
      }
      this.userBalanceInfoMap[type] = inserted;
      // = new UserCategory(
      //   inserted.id,
      //   userId,
      //   title,
      //   accountType,
      //   undefined
      // );
    };
    if (info[UserCreationMaster.TYPE_CASH_STRAGE]) {
      await insertCategory(
        "現金",
        UserCreationMaster.TYPE_CASH_STRAGE,
        AccountType.TYPE_ASSET
      );
    }
    if (info[UserCreationMaster.TYPE_PREPAID]) {
      await insertCategory(
        "プリペイド",
        UserCreationMaster.TYPE_PREPAID,
        AccountType.TYPE_ASSET
      );
    }
    if (info[UserCreationMaster.TYPE_BANK]) {
      await insertCategory(
        "預金",
        UserCreationMaster.TYPE_BANK,
        AccountType.TYPE_ASSET
      );
    }
  }
}

const UserCreationModule = getModule(UserCreationStore);
export default UserCreationModule;
