<template>
  <CommonFrame>
      <div class="header">
          <h1>テンプレート</h1>
      </div>
      <div class="list">
          <div class="top">
              <div class="item">
                    <div class="attr t-name"><span>タイトル</span></div>
                    <div class="attr details" ><span>借</span></div>
                    <div class="attr details" ><span>貸</span></div>
                    <div class="attr actions" ><span></span></div>
              </div>
          </div>
          <div class="items">
              <div class="item" v-for="template in templates" :key="template.id">
                    <div class="attr t-name"> 
                        <span>{{ template.name }}</span>
                    </div>
                    <div class="attr details" v-for="(details,dIndex) in [template.credits, template.debits]" :key="dIndex">
                        <div class="detail" v-for="(detail, index) in details" :key="index">
                            <div class="d-attr name" :category-id="detail.category.id"><span>{{ detail.category.name }}</span></div>
                            <div class="d-attr amount"><span>{{ detail.amount ? detail.amount : "-- "}}円</span></div>
                        </div>
                    </div>
                    <div class="attr actions">
                        <SwitchButton
                          :value="!template.unabled"
                          @off="disableTemplate(template)"
                          @on="enableTemplate(template)"
                          on-value="表示"
                          off-value="非表示"
                        ></SwitchButton>
                        
                        <ProcessButton
                            value="削除"
                            :click="deleteTemplate(template)"
                        ></ProcessButton>
                    </div>
              </div>
          </div>
      </div>
  </CommonFrame>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CommonFrame from "@/app/view/common/CommonFrame.vue";
import ITemplate from "@/app/model/interface/ITemplate";
import { container } from "tsyringe";
import TemplateRepository from "@/app/repository/TemplateRepository";
import ProcessButton from "@/app/view/common/ProcessButton.vue";
import SwitchButton from "@/app/view/common/SwitchButton.vue";

@Component({components: {CommonFrame, ProcessButton, SwitchButton}})
export default class Templates extends Vue {
    public templates: ITemplate[] = []

    public async mounted() {
        await this.loadTemplates()
    }

    private async loadTemplates() { 
        this.templates = await container.resolve(TemplateRepository).getAll()
    }

    public async  disableTemplate(template: ITemplate) {
        template.disable()
        await container.resolve(TemplateRepository).update(template)
    }

    public async  enableTemplate(template: ITemplate) {
        template.enable()
        await container.resolve(TemplateRepository).update(template)
    }

    public deleteTemplate(template: ITemplate) {
        return () => container.resolve(TemplateRepository).delete(template)
                    .then(() => this.loadTemplates())
    }
}
</script>

<style lang="scss" scoped>
.header {
    padding: 8px 15px;
    background: #ffffff;
    h1 {
        font-size: 2rem;
        color: $color-main;
        margin: 8px 0px;
    }
}
.list {
    padding: 10px 12px;
    .top {

    }
    .item {
        padding: 8px 5px;
        background: #ffffff;
        margin: 5px 0px;
        display: flex;
        cursor: pointer;
        .attr {
            padding: 0px 6px;
            &.t-name {
                width: 30%;
            }
            &.details {
                width: 25%;
                .detail {
                    display: flex;
                    .d-attr {
                        padding-bottom: 8px;
                        &.name {
                            width: 55%;
                        }
                        &.amount {
                            width: 45%;
                        }
                    }
                }
            }
            &.actions {
                display: flex;
                width: 20%;
            }
        }
    }
    .top {
        border-bottom: 1px solid #808080
    }
    .items {
        .item {
        //   &:hover {
        //     background: #ffffe2;
        //     .attr {
        //     }
        //   }
        }
    }
}

</style>
