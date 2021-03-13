import IJournal from "@/app/model/interface/IJournal";
import IJournalDate from "@/app/model/interface/IJournalDate";
import IUserIdentifiedBaseRepository from "./IUserIdentifiedBaseRepository";
import { DJournal } from "@/app/model/interface/DJournal";

export default interface IJournalRepository
  extends IUserIdentifiedBaseRepository<DJournal, IJournal> {
  getByAccountedAt: (
    from: IJournalDate,
    to: IJournalDate
  ) => Promise<IJournal[]>;
  getByExecutedAt: (
    from: IJournalDate,
    to: IJournalDate
  ) => Promise<IJournal[]>;

  getByAncestorId: (id: string) => Promise<IJournal[]>;
}
