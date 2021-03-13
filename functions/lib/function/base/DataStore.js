"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class DataStore {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }
    static createCollection(name) {
        return (() => {
            if (!DataStore.store) {
                DataStore.store = firebase_admin_1.default.firestore();
            }
            return DataStore.store;
        })().collection(name);
    }
    async get() {
        const res = [];
        const snapShot = await this.collection().get();
        snapShot.forEach((s) => {
            const data = s.data();
            if (!data) {
                return;
            }
            data.id = s.id;
            res.push(data);
        });
        return res;
    }
    async getById(id) {
        const doc = await this.collection().doc(id).get();
        if (!doc.exists) {
            return undefined;
        }
        const data = doc.data();
        if (!data) {
            return undefined;
        }
        data.id = doc.id;
        return data;
    }
    async getByIds(ids) {
        return (await Promise.all(ids.map((id) => this.getById(id)))).filter((data) => !!data);
    }
    async insert(value) {
        const docRef = await this.collection().add(value);
        value.id = docRef.id;
        return value;
    }
    async batchInsert(values) {
        return Promise.all(values.map((v) => this.insert(v)));
    }
    async update(value) {
        await this.collection().doc(value.id).set(value);
        return value;
    }
    async batchUpdate(values) {
        return Promise.all(values.map((val) => this.update(val)));
    }
    async delete(value) {
        await this.collection().doc(value.id).delete();
    }
    async getByKey(index, key) {
        const result = await this.collection().where(index, "==", key).get();
        return Promise.all(result.docs.map((doc) => {
            const data = doc.data();
            data.id = doc.id;
            return data;
        }));
    }
    collection() {
        return DataStore.createCollection(this.collectionName);
    }
}
exports.DataStore = DataStore;
