<script lang="ts">
import { Component, Mixins, Watch } from "vue-property-decorator";
import { Doughnut } from "vue-chartjs";
import { ChartData } from "chart.js";
import Color from "color";
import AppModule from "@/app/store/ApplicationStore";
import * as BalanceService from "@/app/service/BalanceService"

@Component
export default class BalanceChart extends Mixins(Doughnut) {


  public mounted(): void {
    this.update();
  }

  public async update() {
    const balances = (await BalanceService.loadBalances(AppModule.periodEndWith)).filter(b => b.item.type.isReal && b.item.type.isDebit)
    const chartData =  {
      labels: balances.map((blc) => blc.item.name),
      datasets: [
        {
          label: "資産",
          data: balances.map((blc) => blc.amount),
          borderWidth: 1,
          borderColor: "#ffffff",
          backgroundColor: balances.map((d, index) =>
            Color.hsl((index / balances.length) * 360, 50, 40)
              .rgb()
              .string()
          ),
        },
      ],
    } as ChartData;
    this.renderChart(chartData, {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
    });
  }

  @Watch("chartData")
  public onChartDataChanged(): void {
    this.update();
  }
}
</script>
