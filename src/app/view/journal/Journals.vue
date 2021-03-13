<template>
  <CommonFrame ref="page">
    <div class="journals-pp">
      <div class="header">
        <div class="top">
          <h1>仕訳一覧</h1>
        </div>
        <div class="config">
          <div class="date-config">
            <!-- 日付選択時に仕訳一覧が切り替わらないので一旦期間の自由選択は禁止する -->
            <PeriodSelector :edit-period="false"></PeriodSelector>
          </div>
          <div class="filters">
            <CategoryMultiSelector
              :items="filterItems"
              @change="onFilterChanged"
            ></CategoryMultiSelector>
          </div>
        </div>
        <PageLinks :total="totalPage" @select="page = $event"></PageLinks>
      </div>
      <div class="results">
        <div class="jnl header">
          <div class="cell reality"></div>
          <div
            class="cell date sortable"
            :class="{
              'sort asc': sortMethod === 'by_date_asc',
              'sort desc': sortMethod === 'by_date_desc',
            }"
          >
            <input
              @click="
                sortMethod =
                  sortMethod === 'by_date_asc' ? 'by_date_desc' : 'by_date_asc'
              "
              type="button"
              value="発生日"
            />
          </div>

          <div
            class="cell details debits sortable"
            :class="{
              'sort asc': sortMethod === 'by_debit_asc',
              'sort desc': sortMethod === 'by_debit_desc',
            }"
          >
            <input
              @click="
                sortMethod =
                  sortMethod === 'by_debit_asc'
                    ? 'by_debit_desc'
                    : 'by_debit_asc'
              "
              type="button"
              value="借方"
            />
          </div>
          <div
            class="cell details credits sortable"
            :class="{
              'sort asc': sortMethod === 'by_credit_asc',
              'sort desc': sortMethod === 'by_credit_desc',
            }"
          >
            <input
              @click="
                sortMethod =
                  sortMethod === 'by_credit_asc'
                    ? 'by_credit_desc'
                    : 'by_credit_asc'
              "
              type="button"
              value="貸方"
            />
          </div>
          <div class="cell jnl-actions"></div>
        </div>
        <div
          class="jnl"
          v-for="(jnl, index) in displayJournals"
          :key="index + 1"
          :journal-id="jnl.id"
        >
          <div class="cell reality" :class="{ virtual: !jnl.executeAt }"></div>
          <div class="cell check" v-if="false">
            <input type="checkbox" v-model="selectedJournals" :value="jnl" />
          </div>
          <div class="cell date">
            <div class="cell">
              <span>{{ jnl.accountAt.toString() }}</span>
            </div>
          </div>
          <div class="cell details debits">
            <div
              class="detail"
              v-for="(detail, dIndex) in jnl.debits"
              :key="-dIndex"
              :item-id="detail.category.id"
            >
              <router-link
                :to="`/ledger/detail/${detail.category.id}`"
                tag="div"
                class="cell category"
                >{{ detail.category.name }}</router-link>
              <div class="cell amount">{{ detail.amount }}</div>
            </div>
          </div>
          <div class="cell details credits">
            <div
              class="detail"
              v-for="(detail, dIndex) in jnl.credits"
              :key="-dIndex"
              :item-id="detail.category.id"
            >
              <router-link
                :to="`/ledger/detail/${detail.category.id}`"
                tag="div"
                class="cell category"
                >{{ detail.category.name }}</router-link
              >
              <div class="cell amount">{{ detail.amount }}</div>
            </div>
          </div>
          <div class="cell jnl-actions">
            <HiddenActions v-if="jnl.executeAt">
              <div class="nomal-action" @click="editJournal(jnl)">
                <span>編集</span>
              </div>
              <div class="nomal-action" @click="copyJournal(jnl)">
                <span>コピー</span>
              </div>
              <div class="dangerous-action">
                <JournalDelete :journal="jnl" @deleted="onJournalDeleted"></JournalDelete>
              </div>
            </HiddenActions>
          </div>
          <div class="cell memo" v-if="jnl.title">
            <span>{{ jnl.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import IJournal from "@/app/model/interface/IJournal";
import IJournalDate from "@/app/model/interface/IJournalDate";
import AppModule from "@/app/store/ApplicationStore";
import HiddenActions from "@/app/view/common/HiddenActions.vue";
import JournalDelete from "@/app/view/journal/JournalDelete.vue";
import { ICategoryItem } from "@/app/model/interface/ICategory";
import PeriodSelector from "@/app/view/common/PeriodSelector.vue";
import CategoryMultiSelector from "@/app/view/register/components/CategoryMultiSelector.vue";
import { container } from "tsyringe";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import PageLinks from "@/app/view/common/page/PageLinks.vue";
import JournalRepository from "@/app/repository/JournalRepository";

@Component({
  components: {
    CommonFrame,
    HiddenActions,
    JournalDelete,
    PeriodSelector,
    CategoryMultiSelector,
    PageLinks,
  },
})
export default class Journals extends Vue {
  public page: number = 1;

  public get totalPage(): number {
    return Math.floor((this.filteredJournals.length - 1) / 20) + 1;
  }

  public get periodBeginWith(): IJournalDate {
    return AppModule.periodBeginWith;
  }

  public get periodEndWith(): IJournalDate {
    return AppModule.periodEndWith;
  }


  /** 並び変え方法 */
  public sortMethod:
    | "by_date_asc"
    | "by_date_desc"
    | "by_debit_asc"
    | "by_debit_desc"
    | "by_credit_asc"
    | "by_credit_desc" = "by_date_desc";

  public paginate = ["journals"];

  private deletedJournals: IJournal[] = []

  private filterItems: ICategoryItem[] = [];

  public onFilterChanged(filters: ICategoryItem[]) {
    this.filterItems = filters;
    this.$router.push(
      `/journal?filters=${this.filterItems.map((item) => item.id).join(",")}`
    );
  }


  private journals: IJournal[] = []

  public async loadJournals() {
    this.journals  = await container.resolve(JournalRepository).search(cl => cl.where("accountAt", ">=", this.periodBeginWith.toString())
                        .where("accountAt", "<=", this.periodEndWith.toString()))                      
  }

  public get filteredJournals(): IJournal[] {
    const deletedJournalIds = this.deletedJournals.map(jnl => jnl.id)
    const filterItemIds = this.filterItems.map((item) => item.id);
    return this.journals
      .filter((jnl) => {
          if(deletedJournalIds.includes(jnl.id)){
            return false
          }
          // 可視性
          if (!jnl.isVisible) {
            return false;
          }
          // フィルタ
          if (this.filterItems.length === 0) {
            return true;
          }
          return (
            [...jnl.credits, ...jnl.debits].filter((d) =>
              filterItemIds.includes(d.category.id)
            ).length > 0
          );
        })
  }

  public get displayJournals(): IJournal[] {
      return this.filteredJournals
        // ソート
        .sort((a, b) => {
          switch (this.sortMethod) {
            case "by_date_asc":
              return a.accountAt.afterThanOrEqualsTo(b.accountAt) ? 1 : -1;
            case "by_date_desc":
              return a.accountAt.beforeThanOrEqualsTo(b.accountAt) ? 1 : -1;
            case "by_debit_asc":
              return a.debits[0].category.name > b.debits[0].category.name
                ? 1
                : -1;
            case "by_debit_desc":
              return a.debits[0].category.name < b.debits[0].category.name
                ? 1
                : -1;
            case "by_credit_asc":
              return a.credits[0].category.name > b.credits[0].category.name
                ? 1
                : -1;
            case "by_credit_desc":
              return a.credits[0].category.name < b.credits[0].category.name
                ? 1
                : -1;
          }
        })
        // ページネーション対応
        .slice(20 * (this.page - 1), 20 * this.page);
  }

  public selectedJournals: IJournal[] = [];

  public editJournal(journal: IJournal) {
    this.$router.push(`/journalize/edit/${journal.id}`);
  }

  public copyJournal(journal: IJournal) {
    this.$router.push(`/journalize/copy/${journal.id}`);
  }

  public onJournalDeleted(journal: IJournal){
    console.log("journal deleted")
    this.deletedJournals.push(journal)
  }

  public async mounted() {
    const filterQuery = this.$route.query.filters;
    if (filterQuery) {
      this.filterItems = container
        .resolve(UserCategoryItemFlyweight)
        .getByIds((filterQuery as string).split(","));
    }
    this.loadJournals()
  }

  @Watch("periodBeginWith")
  public onPeriodBeginWithChanged() {
    this.loadJournals()
  }
  
  @Watch("periodEndWith")
  public onPeriodEndWithChanged() {
    this.loadJournals()
  }
}
</script>

<style lang="scss">
ul {
  padding: 0px;
  margin: 0;
}
.paginate-links {
  margin: 0px;
  padding: 0px;
  display: flex;
  * {
    color: $color-main;
  }
  li {
    width: 28px;
    border: 1px solid $color-main;
    border-width: 1px 0px 1px 1px;
    display: block;
    list-style: none;
    text-align: center;
    cursor: pointer;
    &:first-child {
      border-radius: 3px 0px 0px 3px;
    }
    &:last-child {
      border-width: 1px 1px 1px 1px;
      border-radius: 0px 3px 3px 0px;
    }
    &.active {
      background-color: $color-main;
      * {
        color: #ffffff;
      }
    }
    a {
      display: block;
      width: calc(100% - 12px);
      height: 100%;
      padding: 8px 6px;
    }
  }
}
</style>
<style lang="scss" scoped>
.journals-pp {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f6f6f6;
  width: 100%;

  $wide-main-width-per: 85%;
  > .header {
    padding: 10px;
    background-color: #ffffff;
    width: calc(100% - 20px);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    > * {
      width: $wide-main-width-per;
      @include lg {
        width: 100%;
      }
    }
    .top {
      h1 {
        font-size: 2rem;
        color: $color-main;
        margin: 8px 0px;
        @include sm {
          margin: 8px 0px;
        }
      }
    }
    .config {
      // width: 99%;
      // box-shadow: 2px 2px 3px 3px rgba(120, 120, 120, 0.25);
      background-color: #ffffff;
      margin-left: -5px;
      margin-bottom: 10px;
      padding: 0px;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      // @include sm {
      // }
      .date-config {
        width: calc(55% - 24px);
        min-width: 580px;
        @include sm {
          min-width: auto;
          width: 100%;
        }
      }
      .filters {
        width: 45%;
        @include sm {
          width: 100%;
        }
      }
    }
    .actions {
      // width: 100%;
      display: flex;
      margin: 20px 0px 10px;
      padding: 8px 0px;
      .action-content {
        .item {
          border: none;
          background-color: transparent;
          border-radius: 3px;
          cursor: pointer;
          transition-delay: 0.1s;
          transition-duration: 0.25s;
          padding: 5px 8px;
          &:disabled {
            color: #e0e0e0;
            cursor: not-allowed;
            &:hover {
              background-color: transparent;
              color: #e0e0e0;
            }
          }
          &:hover {
            background-color: #f6f6f6;
          }
        }
      }
    }
  }
  @include sm {
    padding: 10px 0px;
    h1 {
      margin: 8px 0px;
    }
  }

  .results {
    width: $wide-main-width-per;

    @include lg {
      width: 100%;
    }
    .jnl {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      background-color: #ffffff;
      margin: 5px 0px;

      > .cell {
        $padding-y: 6px;
        padding: 7px $padding-y;
        &.sortable {
          input {
            cursor: pointer;
            border: none;
            background-color: #ffffff;
            outline: none;
            text-align: start;
            width: 100%;
          }
        }
        &.sort {
          position: relative;
          &:after {
            content: "";
            position: absolute;
            top: 10px;
            right: 0px;
            background-image: url("image/sort.svg");
            width: 15px;
            height: 15px;
          }
          // &.asc {
          // }
          &.desc {
            &:after {
              transform: rotate(180deg);
            }
          }
        }
        &.reality {
          width: 15px;

          @include sm {
            order: 2;
            width: calc(60% - #{$padding-y * 2});
          }
          &.virtual {
            position: relative;
            &:after {
              content: "予";
              position: absolute;
              top: 10px;
              left: 0px;
              border-radius: 3px;
              background-color: $color-main;
              color: #ffffff;
              padding: 1px 4px;
            }
          }
        }
        &.check {
          width: calc(5% - #{$padding-y * 2});
        }
        &.date {
          // padding-top: 10px;
          // padding-bottom: 4px;
          width: calc(10% - #{$padding-y * 2});
          .cell {
            padding: 5px 0px;
          }
          @include sm {
            width: calc(30% - #{$padding-y * 2});

            order: 1;
          }
        }
        &.details {
          width: calc(40% - #{$padding-y * 2});
          // background-color: #f6f6f6;
          margin-left: 7px;
          @include sm {
            width: calc(50% - 2px);
            order: 4;
            margin: 5px 0px 0px 0px;
            padding-left: 0px;
            padding-right: 0px;
            &.debits {
              border-right: 2px solid #ffffff;
            }
          }
          .detail {
            display: flex;
            .cell {
              padding: 5px $padding-y;
              &.category {
                width: 70%;
                cursor: pointer;
              }
              &.amount {
                width: 30%;
              }
            }
          }
        }
        &.jnl-actions {
          width: calc(5% - #{$padding-y * 2});
          padding-top: 10px;
          @include sm {
            order: 3;
            width: calc(10% - #{$padding-y * 2});
          }
          .dangerous-action {
            * {
              color: #e80000;
            }
          }
        }
        &.memo {
          margin-left: calc(15px + 10% + #{$padding-y * 4} + 20px);
          width: calc(90% - 22px - #{$padding-y * 4} - 13px);
          position: relative;
          @include sm {
            margin-left: 25px;
            width: (100% - #{$padding-y * 2} - 20px);
            order: 5;
          }
          &:after {
            position: absolute;
            content: "";
            left: -20px;
            top: 7px;
            width: 20px;
            height: 20px;
            background-image: url("image/memo.svg");
          }
        }
      }
      &.header {
        background-color: #ffffff;
        border-bottom: 1px solid #c0c0c0;
        @include sm {
          display: none;
        }
        .cell {
          background-color: transparent;
        }
      }
    }
  }
}
</style>
