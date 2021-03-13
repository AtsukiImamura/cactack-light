import { singleton, container } from "tsyringe";
import IJournalRepository from "@/app/repository/interface/IJournalRepository";
import IJournal from "@/app/model/interface/IJournal";
import IJournalDate from "@/app/model/interface/IJournalDate";
import { DJournal } from "@/app/model/interface/DJournal";
import JournalTransformer from "@/app/repository/transformer/JournalTransformer";
import UserIdentifiedRepositoryBase from "./UserIdentifiedRepositoryBase";

import funcJournalUpdate from "@/app/repository/trigger/journal/onJournalUpdated"
import funcJournalCreate from "@/app/repository/trigger/journal/onJournalCreated"
import JournalDate from "../model/common/JournalDate";


@singleton()
export default class JournalRepository
  extends UserIdentifiedRepositoryBase<DJournal, IJournal>
  implements IJournalRepository {
  constructor() {
    super();
    this.dbKey = "journals";
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

  public async getByAncestorId(id: string): Promise<IJournal[]> {
    return await this.getByKey("ancestorId", id);
  }

  public async insert(journal: IJournal){
    // 関連の更新処理
    await funcJournalCreate(journal.simplify())
    return super.insert(journal)
  }

  public async update(journal: IJournal){
    const before = await container.resolve(JournalRepository).getById(journal.id)
    if(!before){
      throw new Error("journal to be updated not exists!")
    }
    await funcJournalUpdate(before.simplify(), journal.simplify())
    return super.update(journal)
  }


  public async delete(journal: IJournal){
    const after = journal.simplify()
    after.deletedAt = JournalDate.today().toString()
    await this.ref().doc(journal.id).update(after)
    await funcJournalUpdate(journal.simplify(),after)
  }

}
