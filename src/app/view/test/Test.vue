<template>
    <div>
        <Nav></Nav>
        <div class="alert alert-warning" role="alert" v-if="errorMessage">{{ errorMessage }}</div>
        <div class="row">
            <div class="col-3">
                <input type="text" class="form-control" placeholder="account at" v-model="journalInfo.accountAt">
            </div>
            <div class="col-3">
                <input type="text" class="form-control" placeholder="uid" v-model="journalInfo.userId">
            </div>
        </div>
        <div class="row">
            <div class="col" >
                <div class="row" v-for="(detail, index) in journalInfo.debits" :key="index">
                    <div class="col">
                        <select class="form-select" v-model="detail.id">
                            <option v-for="item in categoryItems" :key="item.id" :value="item.id">{{ item.id }}  {{ item.name }}</option>
                        </select>
                    </div>
                    <div class="col">
                        <input type="text" class="form-control" placeholder="amount" v-model="detail.amount">
                    </div>
                </div>
                <input class="btn btn-secondary" type="reset" value="Add Debit" @click="addDebit">
            </div>
            
            <div class="col" >
                <div class="row" v-for="(detail, index) in journalInfo.credits" :key="index">
                    <div class="col">
                        <select class="form-select" v-model="detail.id">
                            <option v-for="item in categoryItems" :key="item.id" :value="item.id">{{ item.id }}  {{ item.name }}</option>
                        </select>
                    </div>
                    <div class="col">
                        <input type="text" class="form-control" placeholder="amount" v-model="detail.amount">
                    </div>
                </div>
                <input class="btn btn-secondary" type="reset" value="Add Credit" @click="addCredit">
            </div>
        </div>
        <input type="button" class="btn btn-primary" value="Add Journal" @click="addJournal">

        <table class="table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">user id</th>
                <th scope="col">account at</th>
                <th scope="col">debit</th>
                <th scope="col">credit</th>
                <th scope="col"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in journals" :key="item.id">
                    <th scope="row">{{ item.id }}</th>
                    <td>{{ item.userId }}</td>
                    <td>{{ item.accountAt }}</td>
                    <td>{{ item.debits }}</td>
                    <td>{{ item.credits }}</td>
                    <td><input class="btn btn-dark" type="reset" value="Edit" @click="editJournal(item)"></td>
                    <td><input class="btn btn-danger" type="reset" value="Delete" @click="deleteJournal(item)"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">


import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { Component, Vue } from "vue-property-decorator";
import { DJournal } from "@/app/model/interface/DJournal";
import TestModule from "./TestStore"

import Nav from "./Nav.vue"

@Component({components: {Nav}})
export default class Test extends Vue {

    public get categoryItems(): any[] {
        return TestModule.categoryItems
    }

    public journals: any[] = []

    public errorMessage: string = ""

    public journalInfo = {
        id: "",
        userId: "",
        accountAt: "",
        credits: [{id: "", amount: 0}],
        debits: [{id: "", amount: 0}]
    }

    public async mounted() {
        await firebase.auth().signInAnonymously()
        if(TestModule.categoryItems.length == 0){
            TestModule.init()
        }
        this.journalInfo.userId = firebase.auth().currentUser!.uid
        if(this.journals.length === 0){
            firebase.firestore().collection("journals").where("userId", "==", firebase.auth().currentUser!.uid).limit(15)
            .get().then(snapShot => {
                this.journals = snapShot.docs.map(doc => {
                    const item = doc.data()
                    item.id = doc.id
                    return item
                })
            })
        }
    }

    public addJournal() {
        this.errorMessage = ""
        if(this.journalInfo.accountAt === ""){
            this.errorMessage = "Account At is required."
            return;
        }
        if([...this.journalInfo.credits, ...this.journalInfo.debits].filter(d => !d.id || !d.amount || Number(d.amount)<= 0).length > 0){
            this.errorMessage = "Journal detail is not valid."
            return;
        }
        const journal = {
                id: "",
                accountAt: this.journalInfo.accountAt,
                credits: this.journalInfo.credits.map(detail => ({categoryItemId: detail.id, amount: Number(detail.amount)})),
                debits: this.journalInfo.debits.map(detail => ({categoryItemId: detail.id, amount: Number(detail.amount)})),
                userId: firebase.auth().currentUser!.uid
            }
        if(this.journalInfo.id) {
            (journal as any).id = this.journalInfo.id
            firebase.firestore().collection("journals").doc(this.journalInfo.id).update(journal)
                .then(() => {
                    this.journals = this.journals.map(jnl => jnl.id === journal.id ? journal : jnl)
                })
        }else {
            firebase.firestore().collection("journals").add(journal).then(value => {
                journal.id = value.id
                this.journals.push(journal)
            })
        }
    }

    public addDebit() {
        this.journalInfo.debits.push({id: "", amount: 0})
    }

    
    public addCredit() {
        this.journalInfo.credits.push({id: "", amount: 0})
    }

    public editJournal(journal: DJournal) {
        this.journalInfo.id = journal.id
        this.journalInfo.accountAt = journal.accountAt
        this.journalInfo.credits = journal.credits.map((d: any) => ({id: d.categoryItemId, amount: d.amount}))
        this.journalInfo.debits = journal.debits.map((d: any) => ({id: d.categoryItemId, amount: d.amount}))
    }

    public deleteJournal(journal: DJournal) {
        firebase.firestore().collection("journals")
            .doc(journal.id)
            .delete()
            .then(() => {
                console.log(`journal ${journal.id} is successfully deleted.`)
                this.journals = this.journals.filter(jnl => jnl.id !== journal.id)
            })
            .catch(err => console.error(err))
    }
}
</script>

<style lang="scss" scoped></style>
