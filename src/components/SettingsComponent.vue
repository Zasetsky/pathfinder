<template>
  <div class="settings-component">
    <div class="settings-component__title">
      <h2>Настройки</h2>
      <a href="https://ssd.rkrs.ru/page/app/rkrs_processes">/ Инструкция</a>
    </div>
    <el-card shadow="never" v-loading="loading">
      <div class="settings-component__card">
        <el-checkbox v-model="isMatchingEnabled" @change="saveSettings">
          <span style="font-weight: 400">Сопоставление поля VK</span>
        </el-checkbox>
        <el-select
          style="width: 100%; margin-left: 20px"
          v-model="selectedField"
          :disabled="!isMatchingEnabled"
          placeholder="Выберите поле в карточке контакта, в котором хранятся ссылки на пользователей в VK"
          @change="saveSettings"
        >
          <el-option
            v-for="item in settingsOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";

@Component
export default class MatchingFieldComponent extends Vue {
  public isMatchingEnabled = false;
  public selectedField: number | null = null;
  public settingsOptions: Array<{ name: string; id: number }> = [];
  public loading = false;

  async created() {
    this.loading = true;
    try {
      await this.fetchSettings();
      await this.fetchAllFields();
    } finally {
      this.loading = false;
    }
  }

  async fetchSettings() {
    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/settings_matching_field/getSettings"
      );

      if (Number(response.data.data[0].field_id)) {
        this.selectedField = Number(response.data.data[0].field_id);
      }

      this.isMatchingEnabled = response.data.data[0].enabled;
    } catch (error) {
      this.$message({
        type: "error",
        message: `Ошибка при получении настроек: ${error}`,
      });
    }
  }

  async fetchAllFields() {
    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/list/getFieldsLead"
      );

      this.settingsOptions = response.data.data;
    } catch (error) {
      console.error("Ошибка при получении полей:", error);
    }
  }

  async saveSettings() {
    const payload = {
      settings: [
        {
          enabled: this.isMatchingEnabled,
          field_id: this.selectedField,
        },
      ],
    };

    if (this.selectedField) {
      try {
        const response = await axios.post(
          "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/settings_matching_field/setSettings",
          payload
        );
        if (response.data.result) {
          this.$message({
            type: "success",
            message: response.data.message,
          });
        } else {
          this.$message({
            type: "error",
            message: response.data.message,
          });
        }
      } catch (error) {
        this.$message({
          type: "error",
          message: `Произошла ошибка при сохранении настроек: ${error}`,
        });
      }
    }
  }
}
</script>
<style lang="scss">
.settings-component {
  font-family: "Roboto";
  margin-top: 40px;

  &__title {
    display: flex;
    align-items: baseline;
    background: #e8eeef;
    padding: 20px;

    h2 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }

    a {
      text-decoration: none;
      color: #2f80ed;
      margin-left: 5px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__card {
    display: flex;
    align-items: center;
    padding: 30px 20px;
  }
}
</style>
