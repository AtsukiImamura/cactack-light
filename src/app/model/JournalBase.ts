import IJournal, {
  IJournalDetail,
  IJournalPeriodInfo,
} from "@/app/model/interface/IJournal";
import JournalDate from "@/app/model/common/JournalDate";
import IJournalDate from "@/app/model/interface/IJournalDate";
import { DJournal } from "@/app/model/interface/DJournal";
import JournalDetail from "./JournalDetail";
import UserIdentifiableBase from "./UserIdentifiableBase";

export default abstract class JournalBase extends UserIdentifiableBase implements IJournal {
  /** 仕訳タイトル（コメント） */
  private _title: string;
  /** 作成日 */
  private _createdAt: IJournalDate;
  /** 発生日 */
  private _accountAt: IJournalDate;
  /** 執行日 */
  private _executeAt: IJournalDate | undefined;
  /** 貸方（右） */
  private _credits: IJournalDetail[] = [];
  /** 借方（左） */
  private _debits: IJournalDetail[] = [];

  private _rawCredits: IJournalDetail[] = [];

  private _rawDebits: IJournalDetail[] = [];

  private _visible: boolean;

  private _period?: IJournalPeriodInfo;

  private _ancestorId?: string;

  /**
   * 仕訳
   * @param id
   * @param userId
   * @param title
   * @param createdAt
   * @param accountAt
   * @param executeAt
   * @param credits
   * @param debits
   * @param period
   */
  constructor(
    id: string,
    userId: string,
    title: string,
    createdAt: string | IJournalDate,
    accountAt: string | IJournalDate,
    executeAt: string | IJournalDate | undefined,
    credits: IJournalDetail[],
    debits: IJournalDetail[],
    visible: boolean,
    period?: IJournalPeriodInfo,
    deletedAt?: IJournalDate
  ) {
    super(id, userId, deletedAt);
    this._title = title;
    this._createdAt = JournalDate.cast(createdAt);
    this._accountAt = JournalDate.cast(accountAt);
    this._executeAt = executeAt ? JournalDate.cast(executeAt) : undefined;
    credits.forEach((d) => this.addCredit(d));
    debits.forEach((d) => this.addDebit(d));
    this._visible = visible;
    period && (this._period = period);
  }

  /**
   * Getter title
   * @return {string}
   */
  public get title(): string {
    return this._title;
  }

  /**
   * Getter createdAt
   * @return {IJournalDate}
   */
  public get createdAt(): IJournalDate {
    return this._createdAt;
  }

  /**
   * Getter accountAt
   * @return {IJournalDate}
   */
  public get accountAt(): IJournalDate {
    return this._accountAt;
  }

  /**
   * Setter accountAt
   * @param {IJournalDate} value
   */
  public set accountAt(value: IJournalDate) {
    this._accountAt = value;
  }


  /**
   * Getter executeAt
   * @return {IJournalDate}
   */
  public get executeAt(): IJournalDate | undefined {
    return this._executeAt ? this._executeAt : undefined;
  }

  public get amount(): number {
    return this._credits.reduce((acc, cur) => (acc += cur.amount), 0);
  }

  public get period(): IJournalPeriodInfo | undefined {
    return this._period;
  }

  public get isVisible(): boolean {
    return this._visible && !this.isDeleted
  }

  public get isReal(): boolean {
    return true;
  }

  public get isValid(): boolean {
    if (this.credits.length === 0 || this.debits.length === 0) {
      return false;
    }
    if (
      [...this.credits, ...this.debits].filter((d) => d.amount <= 0).length > 0
    ) {
      return false;
    }
    if (
      this.credits.reduce((acc, cur) => (acc += cur.amount), 0) !==
      this.debits.reduce((acc, cur) => (acc += cur.amount), 0)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Getter credits
   * @return {IJournalDetail[] }
   */
  public get credits(): IJournalDetail[] {
    return this._credits;
  }

  /**
   * Getter debits
   * @return {IJournalDetail[] }
   */
  public get debits(): IJournalDetail[] {
    return this._debits;
  }

  public get rawDetails(): IJournalDetail[] {
    return [...this._rawCredits, ...this._rawDebits];
  }

  public get balanceItems(): IJournalDetail[] {
    return [
      ...this.credits.map(
        (detail) =>
          new JournalDetail(
            detail.category,
            (detail.category.type.isCredit ? 1 : -1) * detail.amount
          )
      ),
      ...this.debits.map(
        (detail) =>
          new JournalDetail(
            detail.category,
            (detail.category.type.isDebit ? 1 : -1) * detail.amount
          )
      ),
    ];
  }

  public get ancestorId(): string | undefined {
    return this._ancestorId;
  }

  public set ancestorId(id: string | undefined) {
    this._ancestorId = id;
  }

  public get patternId(): string {
    return (
      [
        ...this.credits.map((d) => d.category.id).sort(),
        ...this.debits.map((d) => d.category.id).sort(),
      ].reduce((acc, cur) => (acc += cur), "") + this.accountAt.toString()
    );
  }
  /**
   * この仕訳を実行済みにする
   */
  public execute(): void {
    this._executeAt = JournalDate.today();
  }

  public addCredit(detail: IJournalDetail) {
    this._rawCredits.push(detail);
    for (const d of this._credits) {
      if (d.category.id !== detail.category.id) {
        continue;
      }
      d.add(detail.amount);
      return;
    }
    this._credits.push(detail);
  }

  public addDebit(detail: IJournalDetail) {
    this._rawDebits.push(detail);
    for (const d of this._debits) {
      if (d.category.id !== detail.category.id) {
        continue;
      }
      d.add(detail.amount);
      return;
    }
    this._debits.push(detail);
  }

  public isSamePattern(jnl: IJournal): boolean {
    return this.patternId === jnl.patternId;
  }

  public simplify(): DJournal {
    const djournal = {
      id: this.id,
      userId: this.userId,
      title: this.title,
      createdAt: this.createdAt.toString(),
      accountAt: this.accountAt.toString(),
      executeAt: this.executeAt ? this.executeAt.toString() : "",
      credits: this.credits.map((detail) => ({
        amount: detail.amount,
        categoryItemId: detail.category.id,
        action: detail.action ? detail.action : "",
      })),
      debits: this.debits.map((detail) => ({
        amount: detail.amount,
        categoryItemId: detail.category.id,
        action: detail.action ? detail.action : "",
      })),
      visible: this.isVisible,
      itemIds: [...this.credits, ...this.debits].map(d => d.category.id),
      deletedAt: this._deletedAt
    } as DJournal;
    if (this.period) {
      djournal.period = {
        startAt: this.period.startAt.toString(),
        finishAt: this.period.finishAt.toString(),
        debitCategoryItemId: this.period.debit.id,
        creditCategoryItemId: this.period.credit.id,
      };
    }
    if (this.ancestorId) {
      djournal.ancestorId = this.ancestorId;
    }
    return djournal;
  }
}
