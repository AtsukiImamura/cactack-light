import IJournalDate from "@/app/model/interface/IJournalDate";
import Identifiable, { IUserIdentifiable } from "@/app/model/interface/Identifiable";
import Treatable from "@/app/model/interface/common/Treatable";
import { DJournal } from "@/app/model/interface/DJournal";
import { IUserCategoryItem, ICategoryItem } from "./ICategory";

export default interface IJournal
  extends Identifiable,
  IUserIdentifiable,
    Treatable<DJournal> {
  title: string;

  createdAt: IJournalDate;

  accountAt: IJournalDate;

  executeAt?: IJournalDate;

  credits: IJournalDetail[];

  debits: IJournalDetail[];

  rawDetails: IJournalDetail[];

  amount: number;

  isVisible: boolean;

  period?: IJournalPeriodInfo;

  ancestorId?: string;

  isReal: boolean;
  /** 貸借対照表などで使えるように借方・貸方を考慮した値を持つ詳細項目 */
  balanceItems: IJournalDetail[];

  isValid: boolean;

  execute: () => void;

  addCredit: (detail: IJournalDetail) => void;

  addDebit: (detail: IJournalDetail) => void;

  isSamePattern: (jnl: IJournal) => boolean;

  patternId: string;
}

export interface IJournalDetail {
  category: IUserCategoryItem;

  amount: number;

  action?: string;

  origin?: IJournal;

  add: (val: number) => void;
}

export interface IJournalPeriodInfo {
  // 対象期間のあるもののみ: 開始日
  startAt: IJournalDate;
  // 対象期間のあるもののみ: 終了日
  finishAt: IJournalDate;

  debit: ICategoryItem;

  credit: ICategoryItem;
}

export interface IExecutable {
  executeAt: IJournalDate;

  execute: () => void;
}

export interface IContinuousJournalInfo {
  unit: number;

  day: number;
}

export enum ContinuousUnit {
  BY_WEEK = 0,

  BY_MONTH = 1,
}
