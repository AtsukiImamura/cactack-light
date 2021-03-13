import { container } from "tsyringe";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import IBadgetSetting, { BadgetUnit, IBadget } from "./interface/IBadget";
import { ICategoryItem } from "./interface/ICategory";
import { DBadget } from "./interface/DBadget";
import JournalDate from "./common/JournalDate";
import Badget from "./Badget";
import DBadgetSetting from "./interface/DBadget";
import IJournalDate from "./interface/IJournalDate";
import UserIdentifiableBase from "./UserIdentifiableBase";
import LedgerFirestore from "../repository/firestore/LedgerFirestore";

export default class BadgetSetting extends UserIdentifiableBase implements IBadgetSetting {
  public static parse(raw: DBadgetSetting) {
    return new BadgetSetting(
      raw.id,
      raw.userId,
      raw.title,
      raw.itemId,
      raw.amount,
      raw.unit,
      raw.managementUnit,
      raw.badgets
    );
  }

  private _title: string;

  private _itemId: string;

  private _amount: number;

  private _unit: BadgetUnit;

  private _managementUnit: BadgetUnit;

  private _dBadgets: DBadget[] = [];

  /**
   * Getter title
   * @return {string}
   */
  public get title(): string {
    return this._title;
  }

  public get items(): ICategoryItem[] {
    const item = container.resolve(UserCategoryItemFlyweight).get(this._itemId);
    if (item) {
      return [item];
    }
    return container
      .resolve(UserCategoryItemFlyweight)
      .getByTagId(this._itemId);
  }

  public get itemId(): string {
    return this._itemId;
  }

  /**
   * Getter amount
   * @return {number}
   */
  public get amount(): number {
    return this._amount;
  }

  public get unitAsString(): string {
    switch (this._unit) {
      case BadgetUnit.YEAR:
        return "1年";
      case BadgetUnit.MONTH:
        return "1か月";
      case BadgetUnit.DAY:
        return "1日";
      case BadgetUnit.CUSTOME:
        return "-";
    }
  }

  public get managementUnitAsString(): string {
    switch (this._managementUnit) {
      case BadgetUnit.YEAR:
        return "1年";
      case BadgetUnit.MONTH:
        return "1か月";
      case BadgetUnit.DAY:
        return "1日";
      case BadgetUnit.CUSTOME:
        return "-";
    }
  }

  public get unit(): BadgetUnit {
    return this._unit;
  }

  /**
   * Getter managementUnit
   * @return {BadgetUnit}
   */
  public get managementUnit(): BadgetUnit {
    return this._managementUnit;
  }

  // /**
  //  * Getter badgets
  //  * @return {DBadget[] }
  //  */
  public async loadBadgets(): Promise<IBadget[]> {
    return this.aggregateBadgets();
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

  private async aggregateBadgets(): Promise<IBadget[]> {
    const targetBadgets: DBadget[] = [];
    const today = JournalDate.today();
    switch (this._unit) {
      case BadgetUnit.YEAR:
        for (let ycnt = 0; ycnt < 2; ycnt++) {
          targetBadgets.push({
            year: today.year + ycnt,
            month: 0,
            expectedAmount: this.amount,
          });
        }
        break;
      case BadgetUnit.MONTH:
        if (this.managementUnit === BadgetUnit.CUSTOME) {
          targetBadgets.push(...this._dBadgets);
          break;
        }
        let date = JournalDate.today().getAfterMonthOf(3).lastDayOfUser;
        for (let cnt = 0; cnt < 12; cnt++) {
          targetBadgets.push({
            year: date.year,
            month: date.month,
            expectedAmount: this.amount,
          });
          date = date.getPreviousMonth();
        }
        break;
      case BadgetUnit.DAY:
        return [];
    }
    return await Promise.all(targetBadgets.map(async (b) => {
      return new Badget(
        this,
        b.expectedAmount,
        await this.calcAmount(b.year, b.month),
        this._unit,
        this._managementUnit,
        b.year,
        b.month
      );
    }));
  }

  public async calcCurrent(): Promise<IBadget | undefined> {
    return new Badget(
        this,
        this.amount,
        // this._managementUnit === BadgetUnit.DAY ? JournalDate.today().firstDayOfUser.lastDayOfUser.day * this.amount : this.amount,
        await this.calcAmount(JournalDate.today().yearOfUser, this.managementUnit === BadgetUnit.YEAR ? undefined : JournalDate.today().monthOfUser),
        this._unit,
        this._managementUnit,
        JournalDate.today().year,
        JournalDate.today().month
      );
  }

  /**
   * Getter isFixedAmount
   * @return {boolean}
   */
  public get isFixedAmount(): boolean {
    return this._managementUnit !== BadgetUnit.CUSTOME;
  }

  private async calcAmount(year: number, month?: number): Promise<number> {
    if(month){
      const date = JournalDate.byMonth(year, month)
      const ledger = await container.resolve(LedgerFirestore).getByMonth(date.yearOfUser, date.monthOfUser)
      if(!ledger){
        return 0
      }
      return this.items.reduce((acc, cur) => {
        if((cur.id in ledger.data)){
          return acc += ledger.data[cur.id] * (cur.type.isCredit ? 1 : -1)
        }
        return acc
      }, 0)
    }
    else {
      const dateTo = JournalDate.byMonth(year, 12)
      const dateFrom = JournalDate.byMonth(year, 1)
      const ledgers = await container.resolve(LedgerFirestore).search(
          cl => cl.where("ledgerKey", "<=", `${dateTo.yearOfUser}.${dateTo.monthOfUser<10?"0":""}${dateTo.monthOfUser}`)
                  .where("ledgerKey", ">=", `${dateFrom.yearOfUser}.${dateFrom.monthOfUser<10?"0":""}${dateFrom.monthOfUser}`)
      )
      return ledgers.reduce((acc, led) => 
        acc += this.items.reduce((acc, cur) => {
          if((cur.id in led.data)){
            return acc += led.data[cur.id] * (cur.type.isCredit ? 1 : -1)
          }
          return acc
        }, 0)
      , 0)
    }
  }

  constructor(
    id: string,
    userId: string,
    title: string,
    itemId: string,
    amount: number,
    unit: BadgetUnit,
    managementUnit: BadgetUnit,
    dbadgets: DBadget[],
    deletedAt?: IJournalDate
  ) {
    super(id, userId, deletedAt);
    this._title = title;
    this._itemId = itemId;
    this._amount = amount;
    this._unit = unit;
    this._managementUnit = managementUnit;
    this._dBadgets = dbadgets;
  }
  
  public simplify(): DBadgetSetting {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      itemId: this._itemId,
      amount: this._amount,
      unit: this._unit.valueOf(),
      managementUnit: this._managementUnit.valueOf(),
      badgets: this._dBadgets,
      deletedAt: this._deletedAt
    };
  }
}
