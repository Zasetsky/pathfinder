<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M20 9C21.1046 9 22 8.10457 22 7V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V7C2 8.10457 2.89543 9 4 9M20 9H4M20 9V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V9M12 11V18M12 11L9 14M12 11L15 14"
      :stroke="hover ? '#6FCF97' : '#909399'"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ArchiveIcon extends Vue {
  @Prop({ default: false }) hover!: boolean;
}
</script>
