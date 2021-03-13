<script lang="ts">
import { Component, Mixins, Prop, Watch } from "vue-property-decorator";
import { Bar } from "vue-chartjs";
import { ChartData, ChartOptions } from "chart.js";
import IJournalDate from "@/app/model/interface/IJournalDate";
import JournalDate from "@/app/model/common/JournalDate";
import { ILedgerItem } from "@/app/model/virtual/AccountLedger";
import HistoryFirestore from "@/app/repository/firestore/HistoryFirestore";
import { container } from "tsyringe";
import DHistory from "@/app/model/interface/DHistory";
import UserAuthService from "@/app/service/UserAuthService";
import Color from "color";

@Component
export default class LedgerChart extends Mixins(Bar) {
  @Prop() item!: ILedgerItem;
  @Prop({ default: () => JournalDate.today().toString() }) from!: string;
  @Prop({ default: () => JournalDate.today().toString() }) to!: string;
  @Prop({ default: () => true }) periodical!: boolean;
  @Prop({ default: () => false }) byMonth!: number;


  @Watch("ledger")
  public onLedgerGiven(): void {
    this.update();
  }

  @Watch("from")
  public onBeginWithChanged(): void {
    this.update();
  }

  @Watch("to")
  public onEndWithChanged(): void {
    this.update();
  }

  @Watch("periodical")
  public onPeriodicalConditionChanged(): void {
    this.update();
  }

  @Watch("byMonth")
  public onPeriodTypeChanged() {
    this.update();
    console.log(`begin: ${this.beginWith.toString()}`);
    console.log(`end  : ${this.endWith.toString()}`);
  }


  public get beginWith() {
    return JournalDate.cast(this.from)
  }
  
  public get endWith() {
    return JournalDate.cast(this.to)
  }

  public mounted(): void {
    this.update();
  }

  public async update() {
    if(!this.item){
      return
    }
    const userId = container.resolve(UserAuthService).userId
    if(!userId){
      return
    }
    if(this.item.items && this.item.items.length > 0){
      return this.renderChart(await this.createCategoryChartData(this.item), this.options);
    }else {
      return this.renderChart(await this.createSingleChartData(this.item), this.options)
    }
  }

  public createDataByMonth(histories: DHistory[]) {
    const monthMap: Map<
      string,
      {
        date: IJournalDate;
        dispDate: string;
        amount: number;
        acc: number;
      }
    > = new Map<
      string,
      {
        date: IJournalDate;
        dispDate: string;
        amount: number;
        acc: number;
      }
    >();

    // let curAmount = histories.length > 0 ? histories[0].amount * (this.item.type.isCredit ? 1 : -1) : 0
    for (const hist of histories) {
      const date = JournalDate.cast(hist.date)
      const key = `${date.yearOfUser}/${date.monthOfUser}`;
      if(!monthMap.has(key)){
          monthMap.set(key, {
            date: date,
            dispDate: key,
            amount: 0,
            acc: 0
          });
      }
      monthMap.get(key)!.acc = hist.amount * (this.item.type.isCredit ? 1 : -1);
      monthMap.get(key)!.amount += hist.diff * (this.item.type.isCredit ? 1 : -1)
    }

    let date = this.beginWith
    let curInfo = undefined
    while(date.beforeThanOrEqualsTo(this.endWith)){
      const key = `${date.yearOfUser}/${date.monthOfUser}`;
      if(!monthMap.has(key)){
          monthMap.set(key, {
            date: date,
            dispDate: key,
            amount: 0,
            acc: curInfo ? curInfo.acc : 0,
          });
      }
      curInfo = monthMap.get(key)!
      date = date.getNextMonth()
    }

    const targets = Array.from(monthMap.values()).sort((a, b) =>
      a.date.beforeThanOrEqualsTo(b.date) ? -1 : 1
    );
    
    return targets;
  }


  private createDataByDay(histories: DHistory[]) {
    let dataBases: {
      date: IJournalDate;
      dispDate: string;
      amount: number;
      acc: number;
    }[] = [];
    let curAcc = this.periodical ? 0 : (histories.length > 0 ? (histories[0].amount - histories[0].diff) * (this.item.type.isCredit ? 1 : -1) : 0)
    const historyMap = histories.reduce((acc, cur) => {
      acc.set(cur.date, cur)
      return acc
    }, new Map<string, DHistory>())

    let date = this.beginWith
    while(date.beforeThanOrEqualsTo(this.endWith)){
      const hist = historyMap.get(date.toString())
      const diff = hist ? hist.diff * (this.item.type.isCredit ? 1 : -1) : 0
      curAcc += diff
      dataBases.push({
        date: date,
        dispDate:
          (date.day === 1 ? `${date.month}/1` : `${date.day}` ),
        amount: diff,
        acc: curAcc,
      });
      date = date.getNextDay()
    }
    return dataBases;
  }

  private async createCategoryChartData(item: ILedgerItem): Promise<ChartData>{
    if(item.items.length === 0){
      throw new Error("Ensure length of the items property in arg 'item' is not zero.")
    }
    const categoryDataSets = await Promise.all(item.items.map(item => this.createDataBases(item as ILedgerItem)))
    return {
      labels: categoryDataSets[0].map((d) => d.dispDate),
      datasets: [
         ...categoryDataSets.map((set, index) => ({item: this.item.items[index], data: set}))
            .filter(d => d.data.reduce((a,c) => a || c.amount !== 0 ,false))
            // .filter(d => d.data.red  uce((a,c) => a += c.amount ,0) > 0)
            .map((d, index) => ({
                label: d.item.name,
                yAxisID: "accumulated-amount",
                data: d.data.map((d) => d.acc),
                borderWidth: 1,
                backgroundColor: Color.hsl((index / categoryDataSets.length) * 90 + 160 , 60, 45).alpha(0.4).rgb().string(),
                borderColor: Color.hsl((index / categoryDataSets.length) * 90 + 155 , 80, 45).rgb().string(),
                type: "line",
                cubicInterpolationMode: "monotone",
            })),
        ...categoryDataSets.map((set, index) => ({item: this.item.items[index], data: set}))
            .filter(d => d.data.reduce((a,c) => a || c.amount !== 0 ,false))
            .map((d, index) => ({
                label: d.item.name,
                yAxisID: "amount-per-day",
                data: d.data.map((d) => d.amount),
                borderWidth: 1,
                // borderColor: "#009000",
                backgroundColor: Color.hsl((index / categoryDataSets.length) * 90 + 20 , 80, 40).rgb().string(),
                type: "bar",
            })),
      ],
    } as ChartData; 
  }


  private async createDataBases(item: ILedgerItem) {
    const histories = await container.resolve(HistoryFirestore).search(cl => cl
                                                                              .where("itemId", "==", item.id)
                                                                              .where("date", ">=", this.beginWith.toString())
                                                                              .where("date", "<=", this.endWith.toString())
                                                                              .orderBy("date", "asc")
                                                                     )
    return (this.byMonth
      ? this.createDataByMonth(histories)
      : this.createDataByDay(histories)
    )
  }

  private async createSingleChartData(item: ILedgerItem) {

    // console.log("createSingleChartData >>> ")
    // console.log(item)

    const dataBases = await this.createDataBases(item)
    return {
      labels: dataBases.map((d) => d.dispDate),
      datasets: [
        {
          label: "累積額",
          yAxisID: "accumulated-amount",
          data: dataBases.map(
            (d) => d.acc
          ),
          borderWidth: 1,
          borderColor: "#009000",
          // backgroundColor: "#009000",
          type: "line",
          cubicInterpolationMode: "monotone",
        },
        {
          label: `${this.byMonth ? "月" : "日"}額`,
          yAxisID: "amount-per-day",
          data: dataBases.map((d) => d.amount),
          borderWidth: 1,
          // borderColor: "#009000",
          backgroundColor: "#ffc000",
          type: "bar",
        },
      ],
    } as ChartData; 
  }

  public options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [
        {
          id: "accumulated-amount",
          type: "linear",
          position: "left",
          stacked: true
        },
        {
          id: "amount-per-day",
          type: "linear",
          position: "right",
          stacked: true
        },
      ],
      xAxes: [
        {
          stacked: true
        }
      ]
    },
  } as ChartOptions;
}
</script>
