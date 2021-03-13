<template>
  <div @mouseup="onMouseUp" class="dprc-adjst">
      <!-- <div class="h">
          <ul>
              <li>offsetX: {{ mouse.offsetX }}</li>
              <li>offsetY: {{ mouse.offsetY }}</li>
              <li>screenX: {{ mouse.screenX }}</li>
              <li>screenY: {{ mouse.screenY }}</li>
              <li>clientX: {{ mouse.clientX }}</li>
              <li>clientX: {{ mouse.clientY }}</li>
              <li>x      : {{ mouse.x }}</li>
              <li>y      : {{ mouse.y }}</li>
              <li>hasTarget: {{ hasTarget }}</li>
          </ul>
      </div> -->
      <div class="main"> 
        <div class="left">
            <div class="ticker">
                <div class="tick" v-for="(tick, index) in ticks" :key="index" :style="{top: `${(1-tick.percentile)*100}%`}">
                    <span class="tick-label">{{ tick.amount }}</span>
                </div>
            </div>
        </div>
        <div class="center">
            <div class="stones" ref="stones">
                <div class="block" v-for="(val, index) in graphValues" :key="index"
                    :style="{
                        left: `${5 + 100/graphValues.length*index}%`,
                    }">
                    <div class="line"></div>
                    <div 
                        class="stone" :ref="`stone-${val.index}`"
                        :style="{
                            top: `${100 - val.percentile * 100}%`
                        }"
                        :stone-index="val.index"
                        @mousedown="onMouseDown(val, $event)"
                        @mouseup="onMouseUp"
                        @mousemove="onMouseMove(val, $event)"
                        @mouseout="onMouseDown"
                    >
                        <ul class="debug-info" v-if="false">
                            <li>offsetTop: {{ val.offsetTop}}</li>
                            <li>percentile: {{ Math.floor(val.percentile * 1000) / 1000 }}</li>
                        </ul>
                        <ul class="stone-detail">
                            <!-- <li>{{ val.year }}/{{ val.month }}</li> -->
                            <li>￥{{ val.amount }}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="bottom-ticker">
                <div class="ticker" v-for="(val, index) in graphValues" :key="index"
                    :style="{
                        left: `${5 + 99/graphValues.length*index}%`,
                    }">
                    <span>{{ val.year }}/{{ val.month }}</span>
                </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import JournalDate from "@/app/model/common/JournalDate";
import {  IUserCategoryItem } from "@/app/model/interface/ICategory";
import IJournal from "@/app/model/interface/IJournal";
import Journal from "@/app/model/Journal";
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";

export interface DeprcAdjusterConfig {
    values: {year:number, month: number, amount: number}[],
    
    target: IUserCategoryItem,

    dep: IUserCategoryItem
}

interface DeprcGraghValue {year: number, month: number, amount: number, index: number, offsetTop: number, percentile: number}

@Component({
  components: {
  },
})
export default class DeprcAdjuster extends Vue {
    @Prop({default: () => 
        ({
            values: [
                {year: 2021, month: 1, amount: 5200, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 2, amount: 4200, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 3, amount: 3300, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 4, amount: 2500, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 5, amount: 1800, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 6, amount: 1200, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 7, amount: 700, index: 0, offsetTop: 0, percentile: 0},
                {year: 2021, month: 8, amount: 300, index: 0, offsetTop: 0, percentile: 0},
            ]
        })
    }) config!: DeprcAdjusterConfig

    public graphValues: DeprcGraghValue[] = []

    public targetStone: HTMLDivElement | {} = {}

    public get ticks(): {amount: number, percentile: number}[] {
        const ticks:{amount: number, percentile: number}[] = []
        const maxValue = this.graphValues.reduce((max, val) => max > val.amount ? max : val.amount, 0)
        if (maxValue <= 0) return []
        const base = Math.pow(10, Math.floor(Math.log10(maxValue)))
        for(let cur = 0; cur <= maxValue; cur += base){
            ticks.push({
                amount: cur,
                percentile: cur / maxValue
            })
        }
        return ticks
    }

    @Emit()
    public change() {
        return this.journals
    }
    private get journals(): IJournal[] {
        let curValue = this.graphValues[0].amount
        return this.graphValues.reduce((jnls, val) => 
            {
                if(val.amount === curValue){
                    return jnls
                }
                jnls.push(new Journal(
                    /* id         */    "", 
                    /* userId     */    "", 
                    /* title      */    `減価償却 ${""}`, 
                    /* createdAt  */    JournalDate.today(),
                    /* accountAt  */    JournalDate.byMonth(val.year, val.month),
                    /* executedAt */    JournalDate.today(),
                    /* credits    */    [{
                                            category: this.config.target,
                                            amount: curValue - val.amount,
                                            add: (val) => {}
                                        }], 
                    /* debits     */    [{
                                            category: this.config.dep,
                                            amount: curValue - val.amount,
                                            add: (val) => {}
                                        }], 
                    /* visible    */    true
                ))
                curValue = val.amount
                return jnls
            },
            [] as IJournal[]
        )
    }

    public mouse = {
        offsetX: 0,
        offsetY: 0,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        x:0,
        y:0
    }

    public get hasTarget(): boolean {
        return !!(this.targetStone as any).classList
    }

    public mounted() {
        if(this.config) {
            this.init()
        }
        this.change()
    }

    @Watch("config")
    public onConfigChanged() {
        this.init()
    }

    private init() {
        if (!this.config) return

        const maxValue =  this.config.values.reduce((max, val) => max > val.amount ? max : val.amount, 0)
        this.graphValues = this.config.values.map((val, index) => {
            return {
                ...val,
                index: index,
                offsetTop: 0,
                percentile: val.amount / maxValue
            }
        })
    }

    // private get maxAmount(): number {
    //     return this.graphValues.reduce((max, val) => max > val.amount ? max : val.amount, 0)
    // }

    private get stoneElem(): HTMLDivElement {
        return (this.$refs.stones as HTMLDivElement)
    }

    private get totalHeight(): number {
        return this.stoneElem.clientHeight
    }

    public get firstAmount(): number {
        return this.graphValues.length > 0 ? this.graphValues[0].amount : 0
    }

    public onMouseDown(val:DeprcGraghValue, e: MouseEvent){
        if(!e) return
        this.targetStone = e.target as HTMLDivElement
        (this.targetStone as HTMLDivElement).classList.add("drugging")
    }

    public onMouseUp(){
        if(this.hasTarget){
            (this.targetStone as HTMLDivElement).classList.remove("drugging")
        }
        this.targetStone = {}
        this.change()
    }

    public onMouseMove(val:DeprcGraghValue,e: MouseEvent){
        this.mouse.screenX = e.screenX
        this.mouse.screenY = e.screenY
        this.mouse.offsetX = e.offsetX
        this.mouse.offsetY = e.offsetY
        this.mouse.clientX = e.clientX
        this.mouse.clientY = e.clientY
        this.mouse.x = e.x
        this.mouse.y = e.y

        if (val.index === 0             )   return // 期初価額は動かさない
        if (!this.hasTarget             )   return
        if (e.target != this.targetStone)   return

        val.percentile = 1 - (() => {
            const percentile = (e.clientY - this.stoneElem.offsetTop) / this.totalHeight
            if(percentile > 1) return 1
            if(percentile < 0) return 0
            return percentile
        })()
        val.amount = Math.floor(this.firstAmount * val.percentile)

        // 以前の値を調整する
        for(const oval of this.graphValues.filter(v => v.index < val.index)) {
            if(oval.percentile > val.percentile) continue
            oval.percentile = val.percentile
            oval.amount = Math.floor(this.firstAmount * oval.percentile)
        }
        // 以後の値を調整する
        for(const oval of this.graphValues.filter(v => v.index > val.index)) {
            if(oval.percentile < val.percentile) continue
            oval.percentile = val.percentile
            oval.amount = Math.floor(this.firstAmount * oval.percentile)
        }
    }
}
</script>


<style lang="scss" scoped>
.dprc-adjst {
    height: 100%;
    width: 100%;
    .main {
        margin-top: 40px;
        padding: 20px 0px;
        display: flex;
        height: 100%;
        width: calc(100% - 10px);
        background: #ffffff;
        .left {
            height: 80%;
            width: 120px;
            .ticker {
                position: relative;
                height: 100%;
                background: #ffffff;
                .tick {
                    position: absolute;
                    right: 0px;
                    width: 60px;
                    border-bottom: 1px solid #808080;
                    .tick-label {
                        position: absolute;
                        left: 5px;
                        top: -17px;
                        font-size: 0.8rem;
                        color: #404040;
                    }
                }
            }
        }
        .center {
            height: 80%;
            width: calc(100% - 120px);
            .stones {
                // border: 1px solid #0079ca;
                background: #ffffff;
                position: relative;
                height: 100%;
                width: 100%;
                .block {
                    position: absolute;
                    height: 100%;
                    border-left: 1px solid #808080;
                    .stone {
                        position: absolute;
                        background: transparent;
                        // border: 1px solid #27ffa5;
                        min-width: 40px;
                        height: 90px;
                        position: relative;
                        margin-top: -45px;
                        margin-left: -20px;
                        .debug-info {
                            position: absolute;
                            left: 5px;
                            top: 5px;
                            margin: 0;
                            padding: 0;
                            width: 140px;
                            list-style: none;
                        }
                        .stone-detail {
                            position: absolute;
                            left: 26px;
                            top: 50px;
                            margin: 0;
                            padding: 0;
                            width: 140px;
                            list-style: none;
                            font-size: 0.65rem;
                        }
                        &:after {
                            content: "";
                            width: 24px;
                            height: 24px;
                            border-radius: 12px;
                            left: 8px;
                            top: 32px;
                            background-color: $color-main;
                            position: absolute;
                            cursor: pointer;
                        }
                         &:before {        
                            content: "";
                            position: absolute;  
                            left: -10px;
                            top: 15px;
                            border-radius: 30px;
                            cursor: pointer;

                            transition-duration: 0.3s;
                            transition-delay: 0.1s;
                            transition-property: background-color, width, height, border-radius;
                        }
                        &:hover {
                            &:before {
                                content: "";
                                width: 60px;
                                height: 60px;
                                background-color: #ffe8666e;
                            }
                        }
                        &.drugging {
                            &:after {
                                transition-duration: 0.3s;
                                transition-delay: 0.2s;
                                transition-property: width, height,left,top,border-radius;

                                width: 30px;
                                height: 30px;
                                border-radius: 15px;
                                left: 5px;
                                top: 29px;
                            }
                        }
                    }
                }
            }
            .bottom-ticker {
                position: relative;
                padding: 24px 0px 10px;
                margin-left: -10px;
                .ticker {
                    position: absolute;
                }
            }
        }
        
    }
}


</style>
