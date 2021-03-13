<template>
  <CommonFrame ref="page">
        <div class="depreciation">
            <div class="h">
                <div class="top">
                <h1>減価償却</h1>
                </div>
                <div class="config">
                    <div class="config-item target">
                        <CategorySelector
                        @select="targetItem = $event"
                        ></CategorySelector>
                    </div>
                    <div class="config-item dep">
                        <CategorySelector
                        @select="depItem = $event"
                        ></CategorySelector>
                    </div>
                    
                    <div class="config-item first-amount">
                        <NumberInput v-model="firstAmount"></NumberInput>
                    </div>
                    <div class="config-item period-length">
                        <NumberInput v-model="periodLength"></NumberInput>
                    </div>
                    <div class="config-item create-button">
                        <ProcessButton value="リセット・作成" :click="reset" :disabled="false"></ProcessButton>
                    </div>
                </div>
            </div>
            <div class="b">"
                <div class="adjuster">
                    <DeprcAdjuster v-if="adjusterConfig.values.length > 0" :config="adjusterConfig" @change="onDepreciationJournalsChanged"></DeprcAdjuster>
                </div>
                <div class="journals">
                    <div class="jnl" v-for="(jnl, index) in journals" :key="index">
                        <div class="attr account-at">{{ jnl.accountAt.toString()}}</div>
                        <div class="attr title">{{ jnl.title }}</div>
                        <div class="attr detail debit">
                            <router-link
                                :to="`/ledger/detail/${jnl.debits[0].category.id}`"
                                tag="div"
                                class="cell category"
                            >{{ jnl.debits[0].category.name }}</router-link>
                        </div>
                        <div class="attr amount debit">{{ jnl.debits[0].amount }}</div>
                        <div class="attr detail credit">
                            <router-link
                                :to="`/ledger/detail/${jnl.credits[0].category.id}`"
                                tag="div"
                                class="cell category"
                            >{{ jnl.credits[0].category.name }}</router-link>
                        </div>
                        <div class="attr amount credit">{{ jnl.credits[0].amount }}</div>
                    </div>
                </div>
            </div>
         </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import DeprcAdjuster, { DeprcAdjusterConfig } from "@/app/view/depreciation/DeprcAdjuster.vue"
import IJournal from "@/app/model/interface/IJournal";
import CategorySelector from "@/app/view/register/components/CategorySelector.vue";
import NumberInput from "@/app/view/common/NumberInput.vue";
import { IUserCategoryItem } from "@/app/model/interface/ICategory";
import ProcessButton from "@/app/view/common/ProcessButton.vue";
import JournalDate from "@/app/function/model/date/JournalDate";

@Component({
  components: {
    CommonFrame,
    DeprcAdjuster,
    CategorySelector,
    NumberInput,
    ProcessButton
  },
})
export default class Depreciation extends Vue {

    public journals: IJournal[] = []

    public firstAmount: number = 0

    public periodLength:number = 0

    public targetItem: IUserCategoryItem | undefined = undefined
    
    public depItem: IUserCategoryItem | undefined = undefined

    public configValues: {year:number, month: number, amount: number}[] = []

    public get adjusterConfig(): DeprcAdjusterConfig {
        return {values: this.configValues, target: this.targetItem!, dep: this.depItem!}
    }

    public async reset() {
        if(!this.targetItem) return
        if(this.firstAmount === 0) return
        if(this.periodLength === 0) return

        this.configValues = []

        let month = JournalDate.today()
        for(let cnt = 0; cnt <= this.periodLength; cnt ++){
            this.configValues.push({
                year: month.year,
                month: month.month,
                amount: Math.floor(this.firstAmount * (1 - cnt / this.periodLength))
            })
            month = month.getNextMonth()
        }

        // console.log(this.adjusterConfig)
    }

    public onDepreciationJournalsChanged(journals: IJournal[]) {
        this.journals = journals
    }
}
</script>


<style lang="scss" scoped>
.depreciation {
  .h {
    padding: 10px 0px 0px 10px;
    background-color: #ffffff;
  }
  > div {
    padding-left: 10px;
    padding-right: 10px;
  }
  .top {
    h1 {
      font-size: 2rem;
      color: $color-main;
      margin: 10px 0px;
      @include sm {
        margin: 8px 0px;
      }
    }
  }
  .config {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    width: 100%;

    .config-item {
      position: relative;
      margin: 25px 12px 5px 5px;
      &:before {
        content: "";
        position: absolute;
        top: -20px;
        left: 0px;
      }
      
      &.target {
          width: 150px;
        &:before {
          content: "対象仕訳項目";
        }
      }
        &.dep {
          width: 150px;
        &:before {
          content: "償却費用科目";
        }
      }
      &.first-amount {
        &:before {
          content: "当初価額";
        }
      }
      &.period-length {
          margin-right: 50px;
        &:before {
          content: "償却期間";
        }
        &:after {
            content: "ヵ月";
            position: absolute;
            top: 20px;
            right: -34px;
        }
      }
    }
  }
}
.adjuster {
    width: 100%;
    height: 450px;
}
.journals {
    background: #ffffff;
    .jnl {
        display: flex;
        .attr {
            padding: 8px 10px;
            &.account-at {
                width: 12%;
            }
            &.title {
                width: 25%;
            }
            &.detail {
                width: 18%;
            }
            &.amount {
                width: 12%;
            }
        }
    }
}
</style>
