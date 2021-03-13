import { singleton, container } from "tsyringe";
import IJournalRepository from "@/app/repository/interface/IJournalRepository";
import IJournal from "@/app/model/interface/IJournal";
import StabRepositoryBase from "@/app/repository/stab/StabRepositoryBase";
import IJournalDate from "@/app/model/interface/IJournalDate";
import { DJournal } from "@/app/model/interface/DJournal";
import JournalTransformer from "@/app/repository/transformer/JournalTransformer";

@singleton()
export default class StabJournalRepository
  extends StabRepositoryBase<DJournal, IJournal>
  implements IJournalRepository {
  constructor() {
    super();
    this.dbKey = "journal";
  }

  public async aggregate(journal: DJournal): Promise<IJournal> {
    return container.resolve(JournalTransformer).aggregate(journal);
  }

  public getByAccountedAt(
    from: IJournalDate,
    to: IJournalDate
  ): Promise<IJournal[]> {
    return this.getAll().then((journals) => {
      const targets = [];
      for (const jor of journals) {
        if (jor.accountAt.beforeThan(from) || jor.accountAt.afterThan(to)) {
          continue;
        }
        targets.push(jor);
      }
      return targets;
    });
  }

  public getByExecutedAt(
    from: IJournalDate,
    to: IJournalDate
  ): Promise<IJournal[]> {
    return this.getByAccountedAt(from, to); // TODO: 実装
  }

  public async getByAncestorId(id: string) {
    return [];
  }
}
