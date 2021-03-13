import UserFlyweightBase from "./UserFlyWeightBase";
import { DUserCategory, IUserCategory } from "@/app/model/interface/ICategory";
import { singleton, container } from "tsyringe";
import UserCategory from "@/app/model/UserCategory";
import UserCategoryItemFlyweight from "./UserCategoryItemFlyweight";
import UserCategoryItem from "@/app/model/UserCategoryItem";
import UserTagFlyweight from "./UserTagFlyweight";

@singleton()
export default class UserCategoryFlyweight extends UserFlyweightBase<
  DUserCategory,
  IUserCategory
> {
  constructor() {
    super();
    this.key = "userCategory";
  }

  public async createSimple(name: string, type: number) {
    const category = await this.insert(UserCategory.simple(name, type));
    const item = await container
      .resolve(UserCategoryItemFlyweight)
      .insert(UserCategoryItem.simple(category.id, name));
    return item;
  }

  protected aggregate(data: DUserCategory) {
    const category =  UserCategory.parse(data);
    // タグの場合にアイテムがなくならないようにする
    // console.log("UserCategoryFlyweight >>> ")
    // console.log(data)
    if(data.id.startsWith("&tag&")){
      const cId = data.id
      const tagId  = cId.replace("&tag&", "")
      const tag = container.resolve(UserTagFlyweight).get(tagId)
      if(!tag){
        throw new Error(`UserCategoryFlyweight >>> tag not found! ${tagId}`)
      }

      tag.items.forEach(item => category.addItem(item.name, item.id))
      // console.log("UserCategoryFlyweight >>> category:")
      // console.log(category)
    }
    return category
  }

  protected needImport(item: DUserCategory){
    return !item.deletedAt || item.deletedAt === ""
  }
}
