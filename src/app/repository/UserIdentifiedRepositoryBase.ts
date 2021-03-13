import Identifiable, { IUserIdentifiable,DUserIdentifiable } from "@/app/model/interface/Identifiable";
import Strable from "@/app/model/interface/common/Strable";
import Treatable from "@/app/model/interface/common/Treatable";
import RepositoryBase from "./RepositoryBase";
import { container } from "tsyringe";
import UserAuthService from "@/app/service/UserAuthService";
import ILogicalDeletable, { DLogicalDeletable } from "../model/interface/common/LogicalDeletable";
import JournalDate from "../function/model/date/JournalDate";

import firebase, {firestore} from "firebase/app";
import "firebase/firestore";
import "firebase/auth";


export default abstract class UserIdentifiedRepositoryBase<
  S extends Strable & Identifiable & DUserIdentifiable ,
  T extends Identifiable & Treatable<S> & IUserIdentifiable 
> extends RepositoryBase<S, T> {
  constructor() {
    super();
  }
  public async searchData(queryFunc: (collection: firestore.Query<firestore.DocumentData>) => firestore.Query<firestore.DocumentData>): Promise<S[]>{
    const userId = container.resolve(UserAuthService).userId
    if(!userId){
        throw new Error("user nod found.")
    }
    
    const query = queryFunc(this.ref().where("userId", "==", userId));
    const res = await query.get()
    return res.docs.map(doc => {
      const data = doc.data() as S
      data.id = doc.id
      return data
    })
  }

  public async getAll() {
    const userId = container.resolve(UserAuthService).userId;
    if (!userId) {
      return [];
    }
    return (await this.getByKey("userId", userId)).filter(d => !d.isDeleted)
  }

  public async search(queryFunc: (collection: firestore.Query<firestore.DocumentData>) => firestore.Query<firestore.DocumentData>): Promise<T[]>{
    const dataList = await this.searchData(queryFunc)
    return await Promise.all(dataList.map(d => this.aggregate(d)))
  }

  public delete(value: T): Promise<void> {
    const data = value.simplify()
    data.deletedAt = JournalDate.today().toString()
    return this.ref()
      .doc(value.id)
      .update(data)
  }

  public async insert(value: T): Promise<T> {
    const simplyfied = value.simplify();
    if (typeof (simplyfied as any).userId === "string") {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        throw new Error("user not found.");
      }
      (simplyfied as any).userId = currentUser.uid;
      (value as any)._userId = currentUser.uid;
    }

    simplyfied.id = "";
    const docRef = await this.ref().add(simplyfied);
    return (await this.getById(docRef.id)) as T;
  }

  // public async batchInsert(values: T[]): Promise<T[]> {
  //   const inserts = [];
  //   for (const val of values) {
  //     inserts.push(this.insert(val));
  //   }
  //   return Promise.all(inserts);
  // }

  public async update(value: T): Promise<T> {
    await this.ref()
      .doc(value.id)
      .update(value.simplify());
    return value;
  }

  // public async batchUpdate(values: T[]): Promise<T[]> {
  //   return Promise.all(
  //     values.map((val) => {
  //       return this.ref()
  //         .doc(val.id)
  //         .set(val.simplify());
  //     })
  //   ).then(() => {
  //     return values;
  //   });
  // }

  public async logicalDelete(value: T & ILogicalDeletable) {
    const data = value.simplify() as S & DLogicalDeletable;
    data.deletedAt = JournalDate.today().toString();
    await this.ref()
      .doc(value.id)
      .set(data);
    return value;
  }

  // // 実質使えん気がする
  // public async getAll(): Promise<T[]> {
  //   return this.ref()
  //     .get()
  //     .then((value) => {
  //       const aggregations: Promise<T>[] = [];
  //       value.forEach((doc) => {
  //         const val = doc.data() as S;
  //         val.id = doc.id;
  //         aggregations.push(this.aggregate(val));
  //       });
  //       return Promise.all(aggregations).then((values) => {
  //         return values;
  //       });
  //     });
  // }
}
