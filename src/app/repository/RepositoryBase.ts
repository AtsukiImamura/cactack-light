import Identifiable from "@/app/model/interface/Identifiable";
import Strable from "@/app/model/interface/common/Strable";
import IBaseRepository from "@/app/repository/interface/IBaseRepository";
import Treatable from "@/app/model/interface/common/Treatable";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { container } from "tsyringe";
import UserAuthService from "@/app/service/UserAuthService";

export default abstract class RepositoryBase<
  S extends Strable & Identifiable,
  T extends Identifiable & Treatable<S>
> implements IBaseRepository<S, T> {
  protected dbKey: string = "";

  public abstract aggregate(value: S): Promise<T>;

  protected ref(): firebase.firestore.CollectionReference {
    return firebase.firestore().collection(this.dbKey);
  }

  public async getData(id: string): Promise<S | undefined> {
    const doc = await this.ref()
      .doc(id)
      .get();
    if (!doc.exists) {
      return undefined;
    }
    const data = doc.data() as S;
    data.id = doc.id;
    return data;
  }

  public async getById(id: string): Promise<T | undefined> {
    const data = await this.getData(id);
    if (!data) {
      return undefined;
    }
    const val = await this.aggregate(data);
    if (!val) {
      return val;
    }
    (val as any)._id = id;
    return val;
  }

  public async getByIds(ids: string[]): Promise<T[]> {
    const list =  (await Promise.all(ids.map(id => 
        this.getById(id)
    )))

    if(list.filter(j => !j).length > 0){
      throw new Error("")
    }

    return list as T[]
  }

  public async getAll() {
    const promises = await this.ref().get().then(res => res.docs.map(doc => {
        const data = doc.data() as S
        data.id = doc.id
        return this.aggregate(data)
      })
    )
    const list = await Promise.all(promises)
    return list
  }

  protected async getAllWithoutConvert(): Promise<S[]> {
    return this.ref()
      .get()
      .then((value) => {
        return Promise.all(
          value.docs.filter((doc) => doc.exists).map((doc) => doc.data() as S)
        );
      });
  }

  public clearAll(): Promise<void> {
    return Promise.resolve();
  }

  protected async getByKey(
    index: string,
    key: string,
  ): Promise<T[]> {

    const userId = container.resolve(UserAuthService).userId;
    if (!userId) {
      return [];
    }
    const docs = await this.ref()
      .where("userId", "==", userId)
      .get();
    const aggregations: Promise<T>[] = [];
    docs.forEach((doc) => {
      const data = doc.data() as S;
      data.id = doc.id;
      aggregations.push(this.aggregate(data));
    });

    return Promise.all(aggregations).then((values) => {
      return values;
    });
  }

}
