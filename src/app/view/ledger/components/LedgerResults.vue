<template>
  <div class="ledger-results" 
        v-if="dispLedgers.length > 0"
  >
    <div
      class="ledgers"
      v-masonry="'dispLedgers'"
      transition-duration="0.1s"
      item-selector=".ledger"
      :key="type"
    >
      <div
        v-masonry-tile
        class="ledger"
        v-for="(led, index) in dispLedgers"
        :key="index"
        :id="led.id"
      >
        <LedgerSummary :ledger="led" @detail="toLedgerDetail"></LedgerSummary>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AccountType from "@/app/model/AccountType";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import LedgerSummary from "@/app/view/ledger/LedgerSummary.vue";

import LedgerFactory from "@/app/model/virtual/LedgerFactory"
import AppModule from "@/app/store/ApplicationStore";
import AccountLedger from "@/app/model/virtual/AccountLedger";

@Component({ components: { LedgerSummary } })
export default class LedgerResults extends Vue {
  @Prop({ default: () => AccountType.TYPE_ASSET }) type!: number;

  public ledgers: AccountLedger[] = []

  public get dispLedgers(): AccountLedger[] {
    return this.ledgers.filter((led) => this.type === led.type.code);
  }

  public get periodBeginWith() {
    return AppModule.periodBeginWith
  }
  public get periodEndWith() {
    return AppModule.periodEndWith
  }

  @Watch("periodBeginWith")
  public onPeriodBeginwith() {
    this.update()
  }

  @Watch("periodEndWith")
  public onPeriodEndWith() {
    this.update()
  }

  // @Watch("type")
  // public onTypeChanged() {
  //   this.update()
  // }

  public mounted() {
    this.update()
  }

  public async update() {
    this.ledgers = await LedgerFactory.loadLedgers(this.periodBeginWith.yearOfUser, this.periodBeginWith.monthOfUser)
  }

  public toLedgerDetail(ledger: AccountLedger) {
    this.$router.push(`/ledger/detail/${ledger.id}`);
  }
}
</script>

<style lang="scss" scoped>
.ledger-results {
  background-color: #f6f6f6;
  height: 100%;
  padding-top: 8px;
  // @include sm {
  //   min-height: calc(100vh - 237px);
  // }
  .ledgers {
    display: flex;
    flex-wrap: wrap;
    .ledger {
      width: calc(33% - 7px);
      margin: 4px 10px 4px 0px;
      @include xs {
        width: 100%;
      }
    }
  }
}
</style>
