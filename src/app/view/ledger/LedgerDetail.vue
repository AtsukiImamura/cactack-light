<template>
  <CommonFrame>
    <div class="ledger-detail">
      <div class="h">
        <div class="top">
          <h1>{{ title }}</h1>
        </div>
        <div class="config">
          <div class="period-config">
            <PeriodSelector
              :edit-period="true"
              :in-month="periodType === 1"
              @select="onPeriodSelected"
            ></PeriodSelector>
          </div>
          <div class="period-type-config">
            <label for="period-type-selector">表示単位</label>
            <div id="period-type-selector" class="selector">
              <input
                type="button"
                :class="{ selected: periodType === 0 }"
                @click="dispByDay"
                value="日"
              />
              <input
                type="button"
                :class="{ selected: periodType === 1 }"
                @click="dispByMonth"
                value="月"
              />
            </div>
          </div>
          <div class="amount-config" v-show="periodType === 0">
            <input
              id="only-current-period"
              type="checkbox"
              v-model="onlyCurrentPeriod"
            />
            <label for="only-current-period">今期累積額のみ表示</label>
          </div>
        </div>
      </div>
      <div class="main">
        <div class="graphs">
          <div class="amount-graph" v-if="item">
            <LedgerChart
              :item="item"
              :from="periodBeginWith.toString()"
              :to="periodEndWith.toString()"
              :periodical="onlyCurrentPeriod"
              :by-month="periodType === 1"
            ></LedgerChart>
          </div>
        </div>
        <div class="details" >
          <div class="pagenation" v-if="totalPage > 1">
            <PageLinks :total="totalPage" @select="page = $event"></PageLinks>
          </div>
          <div class="header">
            <div class="item">
              <div class="attr date">発生日</div>
              <div class="attr memo">メモ</div>
              <div class="attr amount">借</div>
              <div class="attr amount">貸</div>
            </div>
          </div>
          <div class="items">
            <router-link :to="`/journalize/edit/${item.journal.id}`" tag="div" class="item"  v-for="item in relatedDiffs" :key="item.id">  
              <div class="attr date"><span>{{ item.journal.accountAt.toString() }}</span></div>
              <div class="attr memo"><span>{{ item.journal.title }}</span></div>
              <div class="attr amount" :class="{debit: item.debit!==0}"><span>{{ item.debit !== 0 ? item.debit : "" }}</span></div>
              <div class="attr amount" :class="{credit: item.credit!==0}"><span>{{ item.credit !== 0 ? item.credit : "" }}</span></div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import LedgerSummary from "@/app/view/ledger/LedgerSummary.vue";
import { ILedgerItem } from "@/app/model/virtual/AccountLedger";
import AppModule from "@/app/store/ApplicationStore";
import IJournalDate from "@/app/model/interface/IJournalDate";
import LedgerChart from "@/app/view/ledger/components/LedgerChart.vue";
import PeriodSelector from "@/app/view/common/PeriodSelector.vue";
import { container } from "tsyringe";
import UserCategoryItemFlyweight from "@/app/repository/flyweight/UserCategoryItemFlyweight";
import UserCategoryFlyweight from "@/app/repository/flyweight/UserCategoryFlyweight";
import IJournal from "@/app/model/interface/IJournal";
import JournalRepository from "@/app/repository/JournalRepository";
import PageLinks from "@/app/view/common/page/PageLinks.vue";

@Component({
  components: {
    CommonFrame,
    LedgerSummary,
    LedgerChart,
    PeriodSelector,
    PageLinks
  },
})
export default class GeneralLedger extends Vue {
  public periodBeginWith: IJournalDate = AppModule.periodBeginWith;
  public periodEndWith: IJournalDate = AppModule.periodEndWith;

  public categoryItemId: string = "";

  public onlyCurrentPeriod: boolean = false;


  public get item(): ILedgerItem | undefined {
    const item = container.resolve(UserCategoryItemFlyweight).get(this.categoryItemId)
    if(!item){
      const category = container.resolve(UserCategoryFlyweight).get(this.categoryItemId)
      if(!category){
        return
      }
      return category as ILedgerItem
    }
    return item as ILedgerItem
  }

  private get relatedItemIds(): string[] {
    const item = this.item
    if(!item){
      return []
    }
    return (item.items && item.items.length > 0 ?  item.items : [item]).map(c => c.id)
  }

  public relatedJournals: IJournal[] = []

  public async loadRelatedJournals() {
    const item = this.item
    if(!item){
      return
    }
    this.relatedJournals = (await Promise.all((await container.resolve(JournalRepository).search(
      cl => cl.where("itemIds", "array-contains-any", this.relatedItemIds)
              .where("accountAt", ">=", this.periodBeginWith.toString())
              .where("accountAt", "<=", this.periodEndWith.toString())
    )))).filter(jnl => jnl.isVisible)
  }

  public get relatedDiffs() {
    return this.relatedJournals.map(jnl => ({
      journal: jnl,
      credit: jnl.credits.filter(d => this.relatedItemIds.includes(d.category.id)).reduce((acc, cur) => acc += cur.amount, 0),
      debit: jnl.debits.filter(d => this.relatedItemIds.includes(d.category.id)).reduce((acc, cur) => acc += cur.amount, 0)
    }))
    .slice((this.page - 1) * 20, this.page * 20 )
  }

  public page: number = 1

  public get totalPage(): number {
    return Math.ceil(this.relatedJournals.length / 20)
  }

  /* 表示方法 0:日 1:月 */
  public periodType: number = 0;

  public dispByDay() {
    AppModule.setPeriodBeginWith(this.periodEndWith.firstDayOfUser);
    this.periodType = 0;
  }

  public dispByMonth() {
    AppModule.setPeriodBeginWith(
      this.periodEndWith.getPreviousYear().getNextMonth().firstDayOfUser
    );
    this.periodType = 1;
  }

  public onPeriodSelected(from: IJournalDate, to: IJournalDate){
    this.periodBeginWith = from
    this.periodEndWith = to
    this.loadRelatedJournals()
  }

  public get title(): string {
    return this.item ? this.item.name : ""
  }

  public get isReady(): boolean {
    return true
  }

  public async mounted() {
    // 勘定元帳の引き当て
    let categoryItemId = this.$route.params.categoryItemId;
    if (!categoryItemId) {
      this.$router.push("/ledger/general");
      return;
    }
    this.categoryItemId = categoryItemId;
    await this.loadRelatedJournals()
    // if (!this.ledger) {
    //   this.$router.push("/ledger/general");
    //   return;
    // }
  }
}
</script>

<style lang="scss" scoped>
.ledger-detail {
  padding: 0px 0px 10px 0px;
  .h {
    background-color: #ffffff;
    padding-top: 10px;
    .top {
      padding: 0px 6px;
      h1 {
        font-size: 2rem;
        color: $color-main;
        margin: 8px 4px;
        @include sm {
          margin: 8px 4px;
        }
      }
    }
    .config {
      width: calc(100% - 12px);
      background-color: #ffffff;
      margin: 0px 0px;
      padding: 0px 6px;
      display: flex;
      flex-wrap: wrap;
      .period-config {
        max-width: 620px;
      }
      .amount-config {
        // width: calc(35% - 12px);
        width: 200px;
        padding: 12px 0px;
        display: flex;
        align-items: flex-end;
        @include sm {
          width: 100%;
        }
        label {
          display: inline-block;
          padding: 4px 0px 4px 5px;
        }
      }
      .period-type-config {
        padding: 16px 10px 0px 0px;
        label {
          font-size: 0.75rem;
        }
        .selector {
          padding: 4px 2px;
          input {
            border: 1px solid $color-main;
            color: $color-main;
            background-color: #ffffff;
            padding: 4px 8px;
            min-width: 65px;
            margin-right: -4px;
            outline: none;
            &:first-child {
              border-radius: 3px 0px 0px 3px;
            }
            &:last-child {
              border-radius: 0px 3px 3px 0px;
            }
            &.selected {
              background-color: $color-main;
              color: #ffffff;
            }
          }
        }
      }
    }
  }
  .main {
    .details {
      padding-top: 40px;
      background: #ffffff;
      .item {
        display: flex;
        cursor: pointer;
        .attr {
          padding: 8px 12px;
          &.date {
            width: 20%;
          }
          &.memo {
            width: 40%
          }
          &.amount {
            width: 20%
          }
          &.debit {
            background-color: #e2f1ff;
          }
          &.credit {
            background-color: #ffe9e1;
          }
        }
      }
      .pagenation {
        padding: 8px 12px;
      }
      .header {
        border-bottom: 1px solid #808080
      }
      .items {
        .item {
          &:hover {
            background: #ffffe2;
            .attr {
              &.debit {
                background-color: #c1e1ff;
              }
              &.credit {
                background-color: #ffd1c1;
              }
            }
          }
        }
      }
    }
    .graphs {
      margin: 25px 0px;
      width: 100%;
      @include sm {
        overflow: hidden;
        overflow-x: scroll;
      }
      .amount-graph {
        width: 100%;
        @include sm {
          width: 800px;
        }
      }
    }
  }
}
</style>
