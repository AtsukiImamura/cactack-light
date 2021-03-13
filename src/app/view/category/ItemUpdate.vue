<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import ItemEditor from "./ItemEditor.vue";
import { container } from "tsyringe";
import UserCategoryItem from "@/app/model/UserCategoryItem";
import UserAuthService from "@/app/service/UserAuthService";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";

@Component({})
export default class ItemUpdate extends Mixins(ItemEditor) {
  protected dispStr: string = "編集";

  public async execute(): Promise<void> {
    return this.updateItem();
  }

  private async updateItem() {
    if (!this.item) {
      throw new Error("item is required for update");
    }
    const userId = container.resolve(UserAuthService).userId;
    if (!userId) {
      return;
    }

    await container.resolve(UserCategoryItemFlyweight).update(
      new UserCategoryItem(
        this.item.id,
        userId,
        this.item.parent.id,
        this.name,
        undefined,
        false,
        (await this.addTagsIfNotExist()).map((t) => t.id),
      )
    );
  }
}
</script>
