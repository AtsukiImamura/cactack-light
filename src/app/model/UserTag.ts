import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import { container } from "tsyringe";
import AccountType from "./AccountType";
import { IUserCategoryItem } from "./interface/ICategory";
import IJournalDate from "./interface/IJournalDate";
import { IUserTag, DUserTag } from "./interface/ITag";
import UserIdentifiableBase from "./UserIdentifiableBase";

export default class UserTag extends UserIdentifiableBase implements IUserTag {
  public static parse(data: DUserTag) {
    return new UserTag(data.id, data.userId, data.name);
  }

  private _name: string;

  constructor(id: string, userId: string, name: string,
    deletedAt?: IJournalDate
    ) {
    super(id, userId, deletedAt);
    this._name = name;
  }

  public readonly type: AccountType = new AccountType(AccountType.TYPE_OTHER);
  /**
   * Getter name
   * @return {string }
   */
  public get name(): string {
    return this._name;
  }

  public get items(): IUserCategoryItem[] {
    return container.resolve(UserCategoryItemFlyweight).getByTagId(this._id);
  }

  public simplify(): DUserTag {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      deletedAt: this._deletedAt
    };
  }
}
