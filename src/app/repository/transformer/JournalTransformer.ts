import Transformer from "@/app/repository/transformer/Transformer";
import { DJournal, DJournalDetail } from "@/app/model/interface/DJournal";
import IJournal, { IJournalDetail } from "@/app/model/interface/IJournal";
import { singleton, container } from "tsyringe";
import Journal from "@/app/model/Journal";
import JournalDate from "@/app/model/common/JournalDate";
import JournalDetail from "@/app/model/JournalDetail";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import { IUserCategoryItem } from "@/app/model/interface/ICategory";

@singleton()
export default class JournalTransformer extends Transformer<
  DJournal,
  IJournal
> {
  public async aggregate(journal: DJournal): Promise<IJournal> {
    let periodDebit: IUserCategoryItem | undefined = undefined;
    let periodCredit: IUserCategoryItem | undefined = undefined;

    if (journal.period) {
      periodDebit = container
        .resolve(UserCategoryItemFlyweight)
        .get(journal.period.debitCategoryItemId);

      periodCredit = container
        .resolve(UserCategoryItemFlyweight)
        .get(journal.period.creditCategoryItemId);
      if (!periodDebit || !periodCredit) {
        throw new Error("JournalTransformer >>> category item not found.");
      }
    }
    const created = new Journal(
      journal.id,
      journal.userId,
      journal.title,
      journal.createdAt,
      journal.accountAt,
      journal.executeAt ? journal.executeAt : undefined,
      await this.toJournalDetails(journal.credits),
      await this.toJournalDetails(journal.debits),
      journal.visible,
      journal.period
        ? {
            startAt: JournalDate.cast(journal.period.startAt),
            finishAt: JournalDate.cast(journal.period.finishAt),
            debit: periodDebit!,
            credit: periodCredit!,
          }
        : undefined,
        journal.deletedAt ? JournalDate.cast(journal.deletedAt) : undefined
    );
    created.ancestorId = journal.ancestorId ? journal.ancestorId : "";
    return created;
  }

  private async toJournalDetails(
    details: DJournalDetail[]
  ): Promise<IJournalDetail[]> {
    const results: IJournalDetail[] = [];
    for (const detail of details) {
      const item = container
        .resolve(UserCategoryItemFlyweight)
        .get(detail.categoryItemId);
      if (!item) {
        continue;
      }
      results.push(new JournalDetail(item.id, detail.amount, detail.action));
    }
    return results;
  }
}
