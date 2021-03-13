import ITemplate from "@/app/model/interface/ITemplate";
import DTemplate from "@/app/model/interface/DTemplate";
import IUserIdentifiedBaseRepository from "./IUserIdentifiedBaseRepository";

export default interface ITemplateRepository
  extends IUserIdentifiedBaseRepository<DTemplate, ITemplate> {}
