import JournalDate from "@/app/model/common/JournalDate";
import IJournalDate from "@/app/model/interface/IJournalDate";
import { IUserConfig, DUserConfig } from "./interface/IUserConfig";
import UserIdentifiableBase from "./UserIdentifiableBase";

export default class UserConfig extends UserIdentifiableBase implements IUserConfig {
  public static parse(config: DUserConfig) : IUserConfig{
    return new UserConfig(config.id, config.userId, config.key, config.value)
  }

  public static simple(key: string, value: string | number) {
    return new UserConfig("", "", key, value);
  }


  private _key: string;

  private _value: string | number;

  constructor(id: string, userId: string, key: string, value: string | number, deletedAt?: IJournalDate) {
    super(id, userId, deletedAt);
    this._key = key;
    this._value = value;
  }

  /**
   * Getter key
   * @return {string}
   */
  public get key(): string {
    return this._key;
  }

  /**
   * Getter value
   * @return {string }
   */
  public get value(): string | number {
    return this._value;
  }

  public get isDeleted(): boolean {
    return this._deletedAt !== ""
  }

  public get deletedAt(): IJournalDate | undefined {
    if(this._deletedAt == "") {
      return undefined
    }
    return JournalDate.cast(this._deletedAt)
  }

  /**
   * Setter value
   * @param {string } value
   */
  public set value(value: string | number) {
    this._value = value;
  }

  public simplify(): DUserConfig {
    return {
      id: this.id,
      userId: this.userId,
      key: this.key,
      value: this.value,
      deletedAt: ""
    };
  }
}
