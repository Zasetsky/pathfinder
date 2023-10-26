<template>
  <div class="billing-component" v-loading="loading">
    <div class="billing-component__title">
      <h2>Биллинг</h2>
      <a href="https://ssd.rkrs.ru/page/app/rkrs_processes">/ Инструкция</a>
    </div>

    <div class="billing-component__filter-section">
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="-"
        start-placeholder="Дата от"
        end-placeholder="Дата до"
      />
      <el-cascader
        style="width: 300px; margin: 0 10px"
        v-model="selectedInitiators"
        :props="{ multiple: true }"
        :options="initiators"
        placeholder="Инициаторы запроса"
        collapse-tags
        clearable
      />
      <el-button type="primary" @click="applyFilter">Фильтровать</el-button>
    </div>

    <div class="total-cost">Затрат за выбранный период: {{ totalCost }} ₽</div>

    <div class="billing-component__content">
      <el-card shadow="never">
        <el-table :data="filteredResults" style="width: 100%">
          <el-table-column type="expand">
            <template #default="props">
              <el-form v-if="props.row.amo_contact_id">
                <el-form-item label="Имя контакта:">
                  {{ props.row.initiator }}
                </el-form-item>
                <el-form-item label="ID контакта:">
                  <span
                    style="font-size: 14px; color: #17505b; font-weight: 500"
                    >{{ props.row.amo_contact_id }}</span
                  >
                </el-form-item>
              </el-form>
              <span v-else>Нет данных по вашему запросу</span>
            </template>
          </el-table-column>
          <el-table-column
            label="Дата запроса"
            prop="created_at"
          ></el-table-column>
          <el-table-column
            label="Кто сделал запрос"
            prop="initiator"
          ></el-table-column>
          <el-table-column
            label="Тип запроса"
            prop="type_text"
          ></el-table-column>
          <el-table-column label="Запрос" prop="request"></el-table-column>
          <el-table-column label="Результат запроса">
            <template #default="props">
              <span v-if="props.row.amo_lead_id !== 0">
                ID сделки:<br />
                <a
                  style="
                    color: #17505b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                  "
                  href="#"
                  >{{ props.row.amo_lead_id }}</a
                >
              </span>
              <span v-else> Нет данных </span>
            </template>
          </el-table-column>
          <el-table-column label="Стоимость" prop="cost"></el-table-column>
        </el-table>

        <el-pagination
          style="margin-top: 16px"
          @current-change="handlePageChange"
          :current-page="pagination.current_page"
          :page-size="pagination.limit_page"
          layout="prev, pager, next, jumper"
          :total="pagination.total"
        />
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import { BillingData, Pagination, Initiator } from "./billing.types";

@Component
export default class BillingComponent extends Vue {
  public filteredResults: BillingData[] = [];
  public pagination: Pagination = {
    count: 0,
    total: 0,
    limit_page: 10,
    current_page: 1,
  };
  public totalCost = 0;

  public dateRange: [Date | null, Date | null] | null = null;
  public selectedInitiators: Array<string | number> | null = null;
  public initiators: Array<Initiator> = [];
  public currentFilters: any = {};
  public loading = false;

  async created() {
    this.loading = true;
    await this.fetchInitiators();
    await this.fetchResults();
    this.loading = false;
  }

  public async fetchInitiators() {
    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/billing/getListInitiator"
      );
      this.initiators = response.data.data;
    } catch (error) {
      console.error("Error fetching initiators:", error);
    }
  }

  public async handlePageChange(page: number) {
    this.pagination.current_page = page;
    this.loading = true;
    await this.fetchResults();
    this.loading = false;
  }

  public async applyFilter() {
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const ss = String(date.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    const filters = {
      initiator: this.selectedInitiators ? this.selectedInitiators : null,
      date_from: this.dateRange ? formatDate(this.dateRange[0]) : null,
      date_to: this.dateRange ? formatDate(this.dateRange[1]) : null,
    };
    this.currentFilters = filters;

    this.loading = true;
    await this.fetchResults();
    this.loading = false;
  }

  private async fetchResults(
    filters: any = this.currentFilters,
    page: number = this.pagination.current_page
  ) {
    const requestData: any = { page, ...filters };
    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/billing/get",
        requestData
      );

      this.filteredResults = response.data.data;
      this.pagination = response.data.pagination;
      this.totalCost = response.data.total_cost;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styles/element-variables.scss";
.billing-component {
  margin-top: 40px;
  background: #f5f7fa;
  font-family: "Roboto", sans-serif !important;

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

  &__filter-section {
    display: flex;
    align-items: center;
    padding: 20px;
  }

  .total-cost {
    color: #606266;
    font-size: 16px;
    padding: 0 20px;
    font-weight: 500;
  }

  &__content {
    padding: 20px;
  }

  .el-table__expanded-cell[class*="cell"] {
    padding: 20px 50px !important;
  }

  .el-form-item {
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    padding: 0;
    color: #909399;

    &__label {
      color: #909399;
    }
  }

  .el-table__row {
    height: 71px;
  }

  .el-pager li {
    font-weight: 500;
  }

  .el-pager li.active {
    color: #6fcf97;
  }

  .el-pager li:hover {
    color: #6fcf97;
  }
}
</style>
