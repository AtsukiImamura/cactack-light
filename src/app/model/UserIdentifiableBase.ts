import JournalDate from "./common/JournalDate";
import IdBase from "./IdBase";
import { IUserIdentifiable } from "./interface/Identifiable";
import IJournalDate from "./interface/IJournalDate";

export default abstract class UserIdentifiableBase extends IdBase implements IUserIdentifiable {
  protected _deletedAt: string;

  protected _userId: string;


  public get userId(): string {
    return this._userId
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

  constructor(id: string, userId: string, deletedAt?: IJournalDate) {
    super(id)
    this._userId = userId
    this._deletedAt = deletedAt ? deletedAt.toString() : ""
  }

  
}
