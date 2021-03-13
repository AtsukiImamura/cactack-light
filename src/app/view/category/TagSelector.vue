<script lang="ts">
import { Component, Emit, Mixins } from "vue-property-decorator";
import SearchSelector from "@/app/view/common/SearchSelector.vue";
import { SelectionInfo } from "@/app/view/common/Searcher.vue";
import { container } from "tsyringe";
import UserTagFlyweight from "@/app/repository/flyweight/UserTagFlyweight";
import { IUserTag } from "@/app/model/interface/ITag";
import UserTag from "@/app/model/UserTag";
import UserAuthService from "@/app/service/UserAuthService";

@Component({})
export default class TagSelector extends Mixins(SearchSelector) {
  public search(input: string): SelectionInfo[] {
    return container
      .resolve(UserTagFlyweight)
      .getAll()
      .filter((h) => h.name.startsWith(input) || input === "")
      .map((h) => {
        return {
          disp: `${h.name}`,
          content: h,
        };
      });
  }

  public addNew(): void {
    this.select({
      content: new UserTag(
        "",
        container.resolve(UserAuthService).userId,
        this.searchInput
      ),
      disp: this.searchInput,
    });
  }

  @Emit()
  public select(info: SelectionInfo) {
    // TODO: 追加の時
    this.closeSearch();
    return info.content as IUserTag;
  }
}
</script>