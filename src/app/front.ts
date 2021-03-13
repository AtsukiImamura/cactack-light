import "reflect-metadata";
import Router from "vue-router";
import { Vue } from "vue-property-decorator";

import firebase from "firebase/app";

Vue.use(Router);

const router = new Router({
  routes: [
      {
        path: "/test",
        component: () =>
          import(/* webpackChunkName: "test" */ "./view/test/Test.vue"),
      },
      {
        path: "/test/history",
        component: () =>
          import(/* webpackChunkName: "test" */ "./view/test/History.vue"),
      },
      {
        path: "/test/balance",
        component: () =>
          import(/* webpackChunkName: "test" */ "./view/test/Balance.vue"),
      },
  ],
});

firebase.initializeApp({
    apiKey: "AIzaSyD88NWYMMUOegAM5dMBZAG_l3sjdewkgRI",
    authDomain: "cactack-light.firebaseapp.com",
    projectId: "cactack-light",
    storageBucket: "cactack-light.appspot.com",
    messagingSenderId: "206241683759",
    appId: "1:206241683759:web:28f45c57b34429693069da",
    measurementId: "G-8C0DE0BDQE"
  });

new Vue({
    components: { },
    router: router,
  }).$mount("#app");

