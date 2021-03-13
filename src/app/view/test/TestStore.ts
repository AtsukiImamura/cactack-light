import {
    VuexModule,
    getModule,
    Module,
    Action,
    // Mutation,
  } from "vuex-module-decorators";
  import store from ".";
  import firebase, { firestore } from "firebase/app";
    import "firebase/firestore";
  
  @Module({ dynamic: true, store, name: "app", namespaced: true })
  class TestStore extends VuexModule {
    // private _journals: IJournal[] = [];
  

    private _categoryItems: firestore.DocumentData[] = []

    public get categoryItems(): firestore.DocumentData[] {
        return this._categoryItems
    }
   
  
    @Action({ rawError: true })
    public async init() {
        firebase.firestore().collection("userCategoryItem")
        .where("userId", "==", firebase.auth().currentUser!.uid)
        .limit(15)
        .get().then(snapShot => {
            this._categoryItems.push(...snapShot.docs.map(doc => {
                const item = doc.data()
                item.id = doc.id
                return item
            }))
        })
    }
  
   
  }
  
  const TestModule = getModule(TestStore);
  export default TestModule;
  