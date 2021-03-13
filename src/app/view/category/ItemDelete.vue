<template>
  <OpenableModal ref="modal" :option="{ height: 240, enableHeader: true, enableFooter: true }">
    <slot>
      <span>削除</span>
    </slot>
    <template #h>
      <span>補助科目削除</span>
    </template>
    <template #b>
      <div class="message" :class="{ important: !canDelete }">
        <span>{{ message }}</span>
      </div>
      <div class="attr select-item" v-if="!canDelete">
        <CategorySelector @select="alternativeItem = $event"></CategorySelector>
      </div>
    </template>
    <template #f>
      <div class="error-message">
        <span>{{ errorMessage }}</span>
      </div>
      <div class="actions">
        <ProcessButton value="OK" :click="onClickOk" :disabled="!canClickOk"></ProcessButton>
      </div>
    </template>
  </OpenableModal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import OpenableModal from "@/app/view/common/OpenableModal.vue";
import { ICategoryItem, IUserCategoryItem } from "@/app/model/interface/ICategory";
import Selector from "@/app/view/common/Selector.vue";
import ProcessButton from "@/app/view/common/ProcessButton.vue";
import CategorySelector from "@/app/view/register/components/CategorySelector.vue";
import { container } from "tsyringe";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";

@Component({
  components: {
    OpenableModal,
    Selector,
    ProcessButton,
    CategorySelector,
  },
})
export default class ItemDelete extends Vue {
  @Prop()
  protected item!: ICategoryItem;

  public alternativeItem: ICategoryItem = this.item;

  public get message(): string {
    if (this.canDelete) {
      return "補助科目をゴミ箱へ移動します。あとでもとに戻すことができます。";
    }
    return "この補助科目をもつ仕訳が存在します。続けるには全て別の補助科目に置き換える必要があります。";
  }

  public errorMessage: string = "";

  private get canDelete(): boolean {
    // return (
    //   this.item.type.isVirtual ||
    //   !AppModule.jounalDetails.reduce(
    //     (acc, cur) => acc || cur.category.id === this.item.id,
    //     false
    //   )
    // );
    return true // TODO: 一旦OKとする。functionsで対応？
  }

  public get canClickOk(): boolean {
    return (
      this.canDelete ||
      /* 存在 */ (!!this.alternativeItem &&
        /* 現在のものと異なる */ this.alternativeItem.id !== this.item.id)
    );
  }

  public async onClickOk(): Promise<void> {
    await this.execute();
    this.close();
  }

  public close(): void {
    const modal = this.$refs.modal as OpenableModal;
    if (!modal) {
      return;
    }
    modal.close();
  }

  private async execute() {
    
    // ** function で対応予定

    // if (!this.canDelete) {
    //   for (const jnl of AppModule.journals) {
    //     if (
    //       [...jnl.credits, ...jnl.debits].filter(
    //         (d) => d.category.id === this.item.id
    //       ).length === 0
    //     ) {
    //       continue;
    //     }
    //     await container.resolve<IJournalRepository>("JournalRepository").update(
    //       new Journal(
    //         jnl.id,
    //         jnl.userId,
    //         jnl.title,
    //         jnl.createdAt,
    //         jnl.accountAt,
    //         jnl.executeAt,
    //         jnl.credits.map((item) => {
    //           if (item.category.id !== this.item.id) {
    //             return item;
    //           }
    //           return new JournalDetail(
    //             this.alternativeItem! as IUserCategoryItem,
    //             item.amount,
    //             item.action
    //           );
    //         }),
    //         jnl.debits.map((item) => {
    //           if (item.category.id !== this.item.id) {
    //             return item;
    //           }
    //           return new JournalDetail(
    //             this.alternativeItem! as IUserCategoryItem,
    //             item.amount,
    //             item.action
    //           );
    //         }),
    //         true
    //       )
    //     );
    //   }
    // }
    (this.item as IUserCategoryItem).logicalDelete();
    // 補助科目の論理削除
    await container
      .resolve(UserCategoryItemFlyweight)
      .update(this.item as IUserCategoryItem);
    this.onComplete(this.item);
  }

  @Emit("complete")
  public onComplete(item: ICategoryItem) {}
}
</script>

<style lang="scss" scoped>
.message {
  margin-bottom: 20px;
  &.important {
    * {
      color: #ff0000;
    }
  }
}
.attr {
  position: relative;
  margin: 30px 0px 0px;
  &:after {
    position: absolute;
    content: "";
    top: -20px;
    left: 0px;
    font-size: 0.8rem;
  }
  &.select-item {
    width: 270px;
    &:after {
      content: "次の補助科目に置き換え:";
    }
  }
}
</style>
