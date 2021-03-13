import { singleton, container } from "tsyringe";
import DTemplate from "@/app/model/interface/DTemplate";
import ITemplate from "@/app/model/interface/ITemplate";
import ITemplateRepository from "./interface/ITemplateRepository";
import TemplateTransformer from "./transformer/TemplateTransformer";
import UserIdentifiedRepositoryBase from "./UserIdentifiedRepositoryBase";

@singleton()
export default class TemplateRepository
  extends UserIdentifiedRepositoryBase<DTemplate, ITemplate>
  implements ITemplateRepository {
  constructor() {
    super();
    this.dbKey = "tempaltes";
  }

  public async aggregate(template: DTemplate): Promise<ITemplate> {
    return container.resolve(TemplateTransformer).aggregate(template);
  }
}
