<template>
    <ul class="nav nav-tabs">
        <li class="nav-item">
           <router-link class="nav-link" to="/test">Main</router-link>
        </li>
        <li class="nav-item">
           <router-link class="nav-link" to="/test/history">History</router-link>
        </li>
        <li class="nav-item">
           <router-link class="nav-link" to="/test/balance">Balance</router-link>
        </li>
        <!-- <li class="nav-item">
           <router-link class="nav-link" to="/test">Main</router-link>
        </li>
        <li class="nav-item">
           <router-link class="nav-link" to="/test">Main</router-link>
        </li> -->
    </ul>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class Nav extends Vue {
   // @Prop() id!: string
}
</script>

<style lang="scss" scoped></style>
