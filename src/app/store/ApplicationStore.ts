import {
  VuexModule,
  getModule,
  Module,
  Action,
  Mutation,
} from "vuex-module-decorators";
import store from ".";
import IJournal from "@/app/model/interface/IJournal";
import IJournalDate from "@/app/model/interface/IJournalDate";
import { container } from "tsyringe";
import CategoryList from "@/app/model/category/CategoryList";
import JournalDate from "@/app/model/common/JournalDate";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import UserCategoryFlyweight from "@/app/repository/flyweight/UserCategoryFlyweight";
import UserTagFlyweight from "@/app/repository/flyweight/UserTagFlyweight";
import ITemplate from "@/app/model/interface/ITemplate";
import ITemplateRepository from "@/app/repository/interface/ITemplateRepository";
import UserConfigFlyweight from "@/app/repository/flyweight/UserConfigFlyweight";
import UserAuthService from "@/app/service/UserAuthService";
import AccountType from "@/app/model/AccountType";
import UserCategory from "@/app/model/UserCategory";
import JournalRepository from "../repository/JournalRepository";
import { IAccountCategory, IUserCategoryItem } from "../model/interface/ICategory";

@Module({ dynamic: true, store, name: "app", namespaced: true })
class AppStore extends VuexModule {

  private _templates: ITemplate[] = [];

  private _periodBeginWith: IJournalDate = JournalDate.today().getPreviousMonth();

  private _periodEndWith: IJournalDate = JournalDate.today();

  private _currentJournals: IJournal[] = []

  private _categories: IAccountCategory[] = []

  private _categoryItems: IUserCategoryItem[] = []

  /**
   * Getter categories
   * @return {CategoryList }
   */
  public get categories(): IAccountCategory[] {
    return this._categories
  }

  public get categoryItems(): IUserCategoryItem[] {
    return this._categoryItems
  }

  public get categoryList(): CategoryList {
    return new CategoryList(this._categories)
  }

  public get templates(): ITemplate[] {
    return this._templates;
  }

  public get currentJournals(): IJournal[] {
    return this._currentJournals
  }

  /**
   * Getter periodBeginWith
   * @return {IJournalDate }
   */
  public get periodBeginWith(): IJournalDate {
    return this._periodBeginWith;
  }

  @Mutation
  public setPeriodBeginWith(date: IJournalDate) {
    this._periodBeginWith = date;
  }
  /**
   * Getter periodEndWith
   * @return {IJournalDate }
   */
  public get periodEndWith(): IJournalDate {
    return this._periodEndWith;
  }

  @Mutation
  public setPeriodEndWith(date: IJournalDate) {
    this._periodEndWith = date;
  }

  @Action({ rawError: true })
  public async init() {
    await Promise.all([
      container.resolve(UserCategoryItemFlyweight).import(/*force=*/ false).then(items => {
        while(this._categoryItems.length > 0){
          this._categoryItems.pop()
        }
        this._categoryItems.push(...items)
      }),
      container.resolve(UserCategoryFlyweight).import(/*force=*/ false).then(items => {
        while(this._categories.length > 0){
          this._categories.pop()
        }
        this._categories.push(...items)
      }),
      container.resolve(UserConfigFlyweight).import(/*force=*/ false),
    ]);
    container
      .resolve<ITemplateRepository>("TemplateRepository")
      .getAll()
      .then((tempaltes) => {
        this._templates.splice(0, this._templates.length, ...tempaltes);
      });
    container
      .resolve(UserTagFlyweight)
      .import(/*force=*/ false)
      .then(() => {
        // タグ用の仮想勘定科目をFlyweightに登録
        const userId = container.resolve(UserAuthService).userId;
        if (!userId) {
          throw new Error("user not found!");
        }
        const tags = container.resolve(UserTagFlyweight).getAll();
        for (const tag of tags) {
          container
            .resolve(UserCategoryFlyweight)
            .insertVirtual(
              new UserCategory(
                `&tag&${tag.id}`,
                userId,
                tag.name,
                AccountType.TYPE_OTHER,
                undefined
              )
            );
        }
      });
      container.resolve(JournalRepository).search(cl => cl.where("accountAt", ">=", JournalDate.today().getPreviousMonth().toString()))
        .then(jnls => this._currentJournals.push(...jnls))
  }
}

const AppModule = getModule(AppStore);
export default AppModule;
