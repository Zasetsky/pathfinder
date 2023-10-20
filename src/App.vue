<template>
  <div id="app">
    <BalanceComponent />
    <BillingComponent v-if="false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BillingComponent from "./components/billing/BillingComponent.vue";
import BalanceComponent from "./components/BalanceComponent.vue";

@Component({
  components: {
    BillingComponent,
    BalanceComponent,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss"></style>
