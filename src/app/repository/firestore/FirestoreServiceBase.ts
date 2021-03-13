
  import { DUserIdentifiable } from "@/app/model/interface/Identifiable";
import UserAuthService from "@/app/service/UserAuthService";
import firebase, { firestore } from "firebase/app";
  import "firebase/firestore";
import { container } from "tsyringe";
  
  export default class FirestoreServiceBase<T extends DUserIdentifiable> {


    protected collection: firestore.CollectionReference<firestore.DocumentData>;

    constructor(key: string){
        this.collection = firebase.firestore().collection(key);
    }

    public async getById(id: string) {
      try {
          const ref = await this.collection.doc(id).get()
          
          if(!ref.exists) return undefined

          const data = ref.data() as T
          data.id = ref.id
          return data
      }catch(e) {
        console.warn("could not get data of " + id)
        return undefined
      }
    }

    public async search(queryFunc: (collection: firestore.Query<firestore.DocumentData>) => firestore.Query<firestore.DocumentData>){
        const userId = container.resolve(UserAuthService).userId

        if(!userId) throw new Error("user nod found.")

        
        const query = queryFunc(this.collection.where("userId", "==", userId));

        const res = await query.get()
        return res.docs.map(doc => {
          const data = doc.data() as T
          data.id = doc.id
          return data
        })
    }

    public async setById(id: string, value: T){
      if(!id) throw new Error("non-empty string was given as ID.  " + JSON.stringify(value))
      await this.collection.doc(id).set(value);
    }

    public async update(id: string, value: T){
      if(!id)throw new Error("non-empty string was given as ID.  " + JSON.stringify(value))
      await this.collection.doc(id).update(value);
    }

    public async add(value: T){
      return (await this.collection.add(value)).id
    }
}