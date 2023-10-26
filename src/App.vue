<template>
  <div id="app">
    <BalanceComponent />
    <SettingsComponent />
    <ProjectComponent />
    <BillingComponent />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BillingComponent from "./components/billing/BillingComponent.vue";
import ProjectComponent from "./components/projects/ProjectComponent.vue";
import BalanceComponent from "./components/BalanceComponent.vue";
import SettingsComponent from "./components/SettingsComponent.vue";

@Component({
  components: {
    BillingComponent,
    BalanceComponent,
    SettingsComponent,
    ProjectComponent,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss"></style>
