import Identifiable, { DUserIdentifiable } from "@/app/model/interface/Identifiable";
import Strable from "@/app/model/interface/common/Strable";

export interface DJournal extends Identifiable, DUserIdentifiable, Strable {
  title: string;

  createdAt: string;

  accountAt: string;

  executeAt: string;

  credits: DJournalDetail[];

  debits: DJournalDetail[];

  visible: boolean;

  period?: DJournalPeriodInfo;

  ancestorId?: string;
}

export interface DJournalDetail {
  hash?: string;

  amount: number;

  categoryItemId: string;

  action?: string;
}

export interface DJournalPeriodInfo {
  startAt: string;
  // 対象期間のあるもののみ: 終了日
  finishAt: string;

  debitCategoryItemId: string;

  creditCategoryItemId: string;
}
