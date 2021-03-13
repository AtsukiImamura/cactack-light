<template>
    <div>
        
        <Nav></Nav>
        <div>
            <label for="category-item-id-selection"  class="form-label">Category ID</label>
            <select id="category-item-id-selection" class="form-select" v-model="categoryItemId">
                <option v-for="item in categoryItems" :key="item.id" :value="item.id">{{ item.id }}  {{ item.name }}</option>
            </select>
            <input type="text" class="form-control" id="date-from-input" placeholder="" v-model="categoryItemId">
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
                    <tr v-for="item in histories" :key="item.id">
                        <th><input class="form-check-input" type="checkbox" :value="item.id" v-model="seelctedItemIds"></th>
                        <th scope="row">{{ item.id }}</th>
                        <td>{{ item.userId }}</td>
                        <td>{{ item.itemId }}</td>
                        <td>{{ item.date }}</td>
                        <td>{{ item.amount }}</td>
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
export default class History extends Vue {

    public categoryItemId: string = ""

    public dateFrom: string = ""

    public dateTo:string = ""

    public seelctedItemIds: string[] = []

    public set selectAll(val: boolean) {
        if(val){
            this.seelctedItemIds = this.histories.map(hist => hist.id)
        }else {
            this.seelctedItemIds = []
        }
    }

    public get selectAll(): boolean {
        return this.seelctedItemIds.length === this.histories.length
    }

    public get categoryItems(): any[] {
        return TestModule.categoryItems
    }

    public histories:firestore.DocumentData[] = []

    public searchHistory() {
        (() => {
            let query: firestore.CollectionReference<firestore.DocumentData> | firestore.Query<firestore.DocumentData>
                = firebase.firestore().collection("history")
            if(this.categoryItemId){
                query = query.where("itemId", "==", this.categoryItemId)
            }
            if(this.dateFrom){
                query = query.where("date", ">=", this.dateFrom)
            }
             if(this.dateTo){
                query = query.where("date", "<=", this.dateTo)
            }
            return query
        })()
        // firebase.firestore().collection("history")
        // .where("userId", "==", "XL1HusHapiWNUzPJszCubW4xdBP2")
        // .where("itemId", "in", ['1BFFh6PqWuvAzcGgGLfu', '0hD7RsOhkcDseGiuBjOZ'])
        // .where("date", ">=", "2021/01/28")

        //  firestore().collection("history")
        //                 .where("userId", "==", "XL1HusHapiWNUzPJszCubW4xdBP2")
        //                 .where("itemId", "==", "1BFFh6PqWuvAzcGgGLfu")
        //                 .where("date", "<","2021/02/01")
        //                 .orderBy("date", "desc")
        //                 .limit(1)
        // firestore().collection("history")
        // .where("userId", "==", "XL1HusHapiWNUzPJszCubW4xdBP2")
        // .where("itemId", "==", "1BFFh6PqWuvAzcGgGLfu")
        // .where("itemId", "in", Array.from(itemDiffMap.keys())) // itemDiffMapには関係するすべての仕訳項目が入っている
        // .where("date", ">=", "2021/02/02")
        .get().then(snapShot => {
            this.histories = snapShot.docs.map(doc => {
                const item = doc.data()
                item.id = doc.id
                return item
            }).sort((a,b) => a.date < b.date ? 1 : -1)
            this.seelctedItemIds = []
        })
    }

    public deleteHistory(history: firestore.DocumentData){
        firebase.firestore().collection("history")
            .doc(history.id)
            .delete()
            .then(() => {
                console.log(`history ${history.id} is successfully deleted.`)
                this.histories = this.histories.filter(hist => hist.id !== history.id)
            })
            .catch(err => console.error(err))
    }


    public deleteSelected() {
        const tasks: Promise<any>[] = []
        for(const itemId of this.seelctedItemIds) {
            tasks.push(firebase.firestore().collection("history")
            .doc(itemId).delete())
        }
        Promise.all(tasks)
            .then(() => {
                console.log("delete => OK")
                this.histories = this.histories.filter(hist => !this.seelctedItemIds.includes(hist.id))
                this.seelctedItemIds = []
            })
    }

}

</script>

<style lang="scss" scoped></style>
