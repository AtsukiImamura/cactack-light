import "reflect-metadata";
import Router from "vue-router";
import { Vue } from "vue-property-decorator";
import AppMenu from "./view/common/AppMenu.vue";
import DependencyInjectionConfig from "@/app/config/DependencyInjectionConfig";
import { container } from "tsyringe";
import UserAuthService from "@/app/service/UserAuthService";
import "intro.js/introjs.css";
import { VueMasonryPlugin } from "vue-masonry";
import VuePaginate from "vue-paginate";
import routes from "./routes";

import firebase from "firebase/app";
import "firebase/firestore";

Vue.use(VuePaginate as any);
Vue.use(VueMasonryPlugin as any);
// Vue.use(VueIntro as any); // TODO: typeほしい。。。

DependencyInjectionConfig.run();

// キャッシュを有効にする
firebase.firestore().enablePersistence()
  .then(() => console.log("firebase persistence is enabled."))
  .catch(err => console.error(err))

Vue.use(Router);

const router = new Router({
  routes: routes,
});
router.beforeEach((to, from, next) => {
  if (
    !to.path.startsWith("/auth") &&
    !to.path.startsWith("/top") &&
    !to.path.startsWith("/user") &&
    !to.path.startsWith("/test") &&
    !container.resolve(UserAuthService).getFirebaseUser()
  ) {
    next("/auth/login");
    return;
  }
  // next(`/load?to=${to.path}`);
  next();
});

new Vue({
  components: { AppMenu },
  router: router,
}).$mount("#app");
