<template>
    <div>
        
        <Nav></Nav>
        <div>
            <div class="row">
                <div class="col">
                    <label for="date-from-input" class="form-label">Date From (Optional)</label>
                    <input type="text" class="form-control" id="date-from-input" placeholder="yyyy/mm/dd" v-model="dateFrom">
                </div>
                <div class="col">
                    <label for="date-to-input" class="form-label">Date To (Optional)</label>
                    <input type="text" class="form-control" id="date-to-input" placeholder="yyyy/mm/dd"  v-model="dateTo">
                </div>
            </div>
            <input type="button" class="btn btn-primary" value="Search" @click="searchHistory">

        </div>
        <div>
            <div class="mt-1">
                <input class="btn btn-danger" type="reset" value="Delete" @click="deleteSelected">
            </div>
             <table class="table">
                <thead>
                    <tr>
                        <th><input class="form-check-input" type="checkbox" v-model="selectAll"></th>
                        <th scope="col">#</th>
                        <th scope="col">user Id</th>
                        <th scope="col">item Id</th>
                        <th scope="col">date</th>
                        <th scope="col">amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in balances" :key="item.id">
                        <th><input class="form-check-input" type="checkbox" :value="item.id" v-model="seelctedItemIds"></th>
                        <th scope="row">{{ item.id }}</th>
                        <td>{{ item.userId }}</td>
                        <td>{{ item.year }}</td>
                        <td>{{ item.month }}</td>
                        <td>{{ item.date }}</td>
                        <td><input class="btn btn-danger" type="reset" value="Delete" @click="deleteHistory(item)"></td>
                    </tr>
                </tbody>
            </table>
        </div>     
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TestModule from "./TestStore"
  import firebase, { firestore } from "firebase/app";
    import "firebase/firestore";

import Nav from "./Nav.vue"

@Component({components: {Nav}})
export default class Balance extends Vue {

    public dateFrom: string = ""

    public dateTo:string = ""

    public seelctedItemIds: string[] = []

    public set selectAll(val: boolean) {
        if(val){
            this.seelctedItemIds = this.balances.map(bls => bls.id)
        }else {
            this.seelctedItemIds = []
        }
    }

    public get selectAll(): boolean {
        return this.seelctedItemIds.length === this.balances.length
    }

    public get categoryItems(): any[] {
        return TestModule.categoryItems
    }

    public balances:firestore.DocumentData[] = []

    public searchHistory() {
        (() => {
            let query: firestore.CollectionReference<firestore.DocumentData> | firestore.Query<firestore.DocumentData>
                = firebase.firestore().collection("balance")
                    .where("userId" ,"==", firebase.auth().currentUser!.uid)
            if(this.dateFrom){
                query = query.where("date", ">=", this.dateFrom)
            }
             if(this.dateTo){
                query = query.where("date", "<=", this.dateTo)
            }
            return query
        })()
        .get().then(snapShot => {
            this.balances = snapShot.docs.map(doc => {
                const item = doc.data()
                item.id = doc.id
                return item
            }).sort((a,b) => a.date < b.date ? 1 : -1)
            this.seelctedItemIds = []
        })
    }

    public deleteHistory(balance: firestore.DocumentData){
        firebase.firestore().collection("balance")
            .doc(balance.id)
            .delete()
            .then(() => {
                console.log(`balance ${balance.id} is successfully deleted.`)
                this.balances = this.balances.filter(bls => bls.id !== balance.id)
            })
            .catch(err => console.error(err))
    }


    public deleteSelected() {
        const tasks: Promise<any>[] = []
        for(const itemId of this.seelctedItemIds) {
            tasks.push(firebase.firestore().collection("balance")
            .doc(itemId).delete())
        }
        Promise.all(tasks)
            .then(() => {
                console.log("delete => OK")
                this.balances = this.balances.filter(hist => !this.seelctedItemIds.includes(hist.id))
                this.seelctedItemIds = []
            })
    }

}

</script>

<style lang="scss" scoped></style>
