import IJournalDate from "@/app/model/interface/IJournalDate";

export interface IJournalControl {
  seq: number;

  date: IJournalDate;

  amount: number;
}
