import Transformer from "@/app/repository/transformer/Transformer";

import { singleton } from "tsyringe";
import DTemplate from "@/app/model/interface/DTemplate";
import ITemplate from "@/app/model/interface/ITemplate";
import UserTemplate from "@/app/model/UserTemplate";

@singleton()
export default class TemplateTransformer extends Transformer<
  DTemplate,
  ITemplate
> {
  public async aggregate(template: DTemplate): Promise<ITemplate> {
    return UserTemplate.parse(template);
  }
}
