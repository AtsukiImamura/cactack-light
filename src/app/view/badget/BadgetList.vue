<template>
  <CommonFrame class="badget-list">
    <div class="top">
      <div class="left">
        <h1>予算リスト</h1>
      </div>
      <div>
        <router-link
          to="/badget/create"
          tag="input"
          type="button"
          class="btn ok-btn"
          value="新規予算"
        ></router-link>
      </div>
    </div>
    <div class="body">
      <div class="badgets">
        <div class="badget header">
          <div class="attr title">
            <span>名称</span>
          </div>
          <div class="attr targets">
            <span>対象</span>
          </div>
          <div class="attr unit">
            <span>期間</span>
          </div>
          <div class="attr amount">
            <span>金額</span>
          </div>
          <div class="attr actual-amount">
            <span>消化</span>
          </div>
          <div class="attr usage-rate">
            <span>過不足</span>
          </div>
        </div>
        <div
          class="badget"
          v-for="badget in badgets"
          :key="badget.parent.id"
        >
          <template>
            <div class="attr title">
              <span>
                <router-link :to="`/badget/detail/${badget.parent.id}`">
                  {{ badget.parent.title }}
                </router-link>
              </span>
            </div>
            <div class="attr targets">
              <span
                class="icon"
                v-for="item in badget.parent.items"
                :key="item.id"
                @click="toLedgerDetail(item.id)"
                >{{ item.name }}</span
              >
            </div>
            <div class="attr unit">
              <span>{{ badget.parent.unitAsString }}</span>
            </div>
            <div class="attr amount">
              <span>{{ badget.expectedAmount }}円</span>
              <span v-if="badget.parent.managementUnit === 2"
                >/{{ badget.parent.managementUnitAsString }}</span
              >
            </div>
            <div class="attr actual-amount">
              <span>{{ badget.actualAmount }}円</span>
            </div>
            <div class="attr usage-rate">
              <span
                class="value"
                :class="{
                  positive: badget.burningRate > 0,
                  negative: badget.burningRate < 0,
                }"
              >
                {{ badget.burningRate > 0 ? "+" : ""
                }}{{ Math.floor(badget.burningRate * 1000) / 10 }}%
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import IBadgetSetting, { IBadget } from "@/app/model/interface/IBadget";
import { container } from "tsyringe";
import BadgetSettingRepository from "@/app/repository/BadgetSettingRepository";

@Component({ components: { CommonFrame } })
export default class BadgetList extends Vue {
  public configs: IBadgetSetting[] = [];

  public badgets: IBadget[] = []

  public get targetConfigs() {
    return this.configs
  }

  public async mounted() {
    this.configs = await container
      .resolve(BadgetSettingRepository)
      .getAll();
    this.badgets =  (await Promise.all(this.configs.map(c => c.calcCurrent()))).filter(c => !!c) as IBadget[]
  }

  public toLedgerDetail(itemId: string) {
    this.$router.push(`/ledger/detail/${itemId}`);
  }
}
</script>

<style lang="scss" scoped>
.badget-list {
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 10px 15%;
    @include sm {
      padding: 10px 5px;
    }
    .left {
      h1 {
        font-size: 2rem;
        color: $color-main;
      }
    }
  }
  .body {
    padding: 10px 15%;
    @include sm {
      padding: 10px 0px;
    }
    .badgets {
      .badget {
        display: flex;
        background-color: #ffffff;
        padding: 10px 5px;
        margin: 4px 0px;
        &.header {
          border-bottom: 1px solid #c0c0c0;
        }
        &.waiting {
          // @keyframes waiting {
          //   0% {
          //     background-color: #f0f0f0;
          //   }
          //   50% {
          //     background-color: #ffffff;
          //   }
          //   100% {
          //     background-color: #f0f0f0;
          //   }
          // }
          // animation: waiting 2s ease 0s infinite reverse running;
          padding: 24px 5px;
        }
        .attr {
          padding: 0px 5px;
          &.title {
            width: 30%;
            @include sm {
              width: 35%;
            }
          }
          &.targets {
            width: 20%;
            @include sm {
              display: none;
            }
            .icon {
              display: inline-block;
              padding: 2px 4px;
              border-radius: 3px;
              background-color: #f0f0f0;
              margin: 2px;
              cursor: pointer;
            }
          }
          &.unit {
            width: 10%;
          }
          &.amount {
            width: 10%;
            @include sm {
              width: 15%;
            }
          }
          &.actual-amount {
            width: 10%;
            @include sm {
              width: 15%;
            }
          }
          &.usage-rate {
            width: 10%;
            .value {
              &.positive {
                color: #00bd65;
              }
              &.negative {
                color: #f00000;
              }
            }
          }
        }
      }
    }
  }
}
</style>
