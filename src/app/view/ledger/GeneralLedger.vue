<template>
  <CommonFrame>
    <div class="general-ledger">
      <div class="h">
        <div class="top">
          <h1>総勘定元帳</h1>
        </div>
        <div class="config">
          <div class="period-config">
            <PeriodSelector @select="onPeriodChanged"></PeriodSelector>
          </div>
        </div>
        <div class="types">
          <input
            v-for="type in allTypes"
            :key="type.code"
            type="button"
            :class="`type ${
              dispType === type.code
                ? `selected category-color c-${type.code} border`
                : ''
            }`"
            :value="type.name"
            @click="changeType(type.code)"
          />
        </div>
      </div>
      <div class="results" v-if="isReady">
        <LedgerResults :type="dispType"></LedgerResults>
      </div>
    </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import LedgerSummary from "@/app/view/ledger/LedgerSummary.vue";
import LedgerResults from "@/app/view/ledger/components/LedgerResults.vue";
import MonthPicker from "@/app/view/common/MonthPicker.vue";
import AccountType from "@/app/model/AccountType";
import PeriodSelector from "@/app/view/common/PeriodSelector.vue";

@Component({
  components: {
    CommonFrame,
    LedgerSummary,
    MonthPicker,
    PeriodSelector,
    LedgerResults,
  },
})
export default class GeneralLedger extends Vue {
  public dispType: number = AccountType.TYPE_ASSET;

  public isReady: boolean = false;

  public allTypes: AccountType[] = [
    new AccountType(AccountType.TYPE_ASSET),
    new AccountType(AccountType.TYPE_DEBT),
    new AccountType(AccountType.TYPE_SPENDING),
    new AccountType(AccountType.TYPE_INCOME),
    new AccountType(AccountType.TYPE_NET_ASSET),
    new AccountType(AccountType.TYPE_OTHER),
  ];

  public changeType(type: number) {
    this.dispType = type;
    this.$router.push("/ledger/general/" + type);
  }

  public mounted(): void {
    const type = this.$route.params.type;
    if (type && this.allTypes.map((t) => t.code).includes(Number(type))) {
      this.dispType = Number(type);
    }
    this.isReady = true;
  }

}
</script>

<style lang="scss" scoped>
.general-ledger {
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
    .period-config {
      width: 45%;
      min-width: 500px;
      @include sm {
        width: 100%;
        min-width: auto;
      }
    }
  }
  .types {
    padding-top: 6px;
    display: flex;
    .type {
      width: 70px;
      padding: 4px 0px 6px 0px;
      border: none;
      outline: none;
      background-color: #ffffff;
      cursor: pointer;
      &.selected {
        border-bottom-style: solid;
        border-bottom-width: 2px;
        padding: 4px 0px 4px 0px;
      }
    }
  }
  .results {
    background-color: #f6f6f6;
    min-height: calc(100vh - 183px);
    padding-top: 8px;
    @include sm {
      min-height: calc(100vh - 237px);
    }
    // .ledgers {
    //   display: flex;
    //   flex-wrap: wrap;
    //   .ledger {
    //     width: calc(33% - 7px);
    //     margin: 4px 10px 4px 0px;
    //     @include xs {
    //       width: 100%;
    //     }
    //   }
    // }
  }
}
</style>
