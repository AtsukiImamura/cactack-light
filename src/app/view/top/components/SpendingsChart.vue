<script lang="ts">
import { Component, Mixins, Watch } from "vue-property-decorator";
import { Doughnut } from "vue-chartjs";
import { ChartData } from "chart.js";
import Color from "color";
import AccountType from "@/app/model/AccountType";
import AccountLedger from "@/app/model/virtual/AccountLedger";
import LedgerFactory from "@/app/model/virtual/LedgerFactory";
import AppModule from "@/app/store/ApplicationStore";

@Component
export default class SpendingsChart extends Mixins(Doughnut) {
  public updateGrapgh() {
    LedgerFactory.loadLedgers(AppModule.periodEndWith.year, AppModule.periodEndWith.month)
      .then(ledgers => {
        this.ledgers = ledgers
        this.renderChart(this.chartData, {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
        });
      })
  }

  public mounted(): void {
    this.updateGrapgh();
  }

  private ledgers: AccountLedger[] = []

  public get chartData(): ChartData {
    const ledgers = this.ledgers.filter(
      (led) =>
        led.type.code === AccountType.TYPE_SPENDING && led.amount > 0
    );
    return {
      labels: ledgers.map((led) => led.name),
      datasets: [
        {
          label: "費用",
          data: ledgers.map((led) => - led.amount), // デバッグ用
          // data: ledgers.map((led) => led.amount),
          borderWidth: 1,
          borderColor: "#ffffff",
          backgroundColor: ledgers.map((d, index) =>
            Color.hsl((index / ledgers.length) * 360, 50, 40)
              .rgb()
              .string()
          ),
        },
      ],
    } as ChartData;
  }

  @Watch("periodBeginWith")
  public onChartDataChanged(): void {
    this.updateGrapgh();
  }
}
</script>
