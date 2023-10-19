<template>
  <div id="app">
    <BillingComponent msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BillingComponent from "./components/billing/BillingComponent.vue";

@Component({
  components: {
    BillingComponent,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss"></style>
