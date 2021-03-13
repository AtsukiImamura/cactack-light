import { singleton, container } from "tsyringe";
import StabRepositoryBase from "@/app/repository/stab/StabRepositoryBase";
import TemplateTransformer from "@/app/repository/transformer/TemplateTransformer";
import ITemplateRepository from "@/app/repository/interface/ITemplateRepository";
import ITemplate from "@/app/model/interface/ITemplate";
import DTemplate from "@/app/model/interface/DTemplate";

@singleton()
export default class StabTemplateRepository
  extends StabRepositoryBase<DTemplate, ITemplate>
  implements ITemplateRepository {
  constructor() {
    super();
    this.dbKey = "tempaltes";
  }

  public async aggregate(journal: DTemplate): Promise<ITemplate> {
    return container.resolve(TemplateTransformer).aggregate(journal);
  }

  public async getByTemplateId(uid: string): Promise<ITemplate | undefined> {
    return undefined;
  }

}
