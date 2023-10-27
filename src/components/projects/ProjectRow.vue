<template>
  <div class="project-row">
    <el-table :data="projects">
      <el-table-column
        property="name"
        label="Название проекта"
      ></el-table-column>
      <el-table-column>
        <template slot="header">
          Статус
          <el-tooltip
            :visible-arrow="false"
            popper-class="table-tooltip"
            effect="light"
            placement="top"
          >
            <div slot="content">
              <div class="tooltip-content">
                <success_icon_tip /><span>база загружена успешно</span>
              </div>
              <div class="tooltip-content">
                <processing_icon_tip /><span>данные обрабатываются</span>
              </div>
              <div class="tooltip-content">
                <top_up_balance_icon_tip /><span>нужно пополнить баланс</span>
              </div>
              <div class="tooltip-content">
                <error_icon_tip /><span>ошибка валидации файла</span>
              </div>
            </div>
            <tooltip_icon style="margin-left: 5px" />
          </el-tooltip>
        </template>

        <template slot-scope="scope">
          <success_icon v-if="scope.row.status === 1" />
          <processing_icon v-if="scope.row.status === 0" />
          <top_up_balance_icon v-if="scope.row.status === 2" />
          <error_icon v-if="scope.row.status === 3" />
        </template>
      </el-table-column>
      <el-table-column property="count_all" label="Общее"></el-table-column>
      <el-table-column property="count_left" label="Осталось"></el-table-column>
      <el-table-column
        property="count_phones_found"
        label="Найдено телефонов"
      ></el-table-column>
      <el-table-column
        property="count_duplicates_found"
        label="Найдено дублей"
      ></el-table-column>
      <el-table-column
        property="count_lead_created"
        label="Создано сделок"
      ></el-table-column>
      <el-table-column
        property="total_money"
        label="Потрачено всего, ₽"
      ></el-table-column>

      <el-table-column>
        <template slot-scope="scope">
          <i
            :class="{ disabled: !scope.row.status && !scope.row.is_archive }"
            @click="
              downloadReport(
                scope.row.id,
                scope.row.is_archive,
                scope.row.status
              )
            "
            ><download_icon v-if="scope.row.status || scope.row.is_archive" />
            <download_icon_disabled v-else
          /></i>

          <i
            :class="{ disabled: !scope.row.status && !scope.row.is_archive }"
            style="margin-left: 16px"
            @click="
              archiveProject(
                scope.row.id,
                scope.row.is_archive,
                scope.row.status
              )
            "
            ><archive_icon v-if="scope.row.status && !scope.row.is_archive" />
            <unzip_icon v-else-if="scope.row.is_archive" />
            <archive_icon_disabled v-else
          /></i>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Project } from "./project.types";
import axios from "axios";
import {
  success_icon_tip,
  processing_icon_tip,
  top_up_balance_icon_tip,
  error_icon_tip,
  tooltip_icon,
  success_icon,
  processing_icon,
  top_up_balance_icon,
  error_icon,
  download_icon,
  archive_icon,
  download_icon_disabled,
  archive_icon_disabled,
  unzip_icon,
} from "../../assets/icons/index";

@Component({
  components: {
    success_icon_tip,
    processing_icon_tip,
    top_up_balance_icon_tip,
    error_icon_tip,
    tooltip_icon,
    success_icon,
    processing_icon,
    top_up_balance_icon,
    error_icon,
    download_icon,
    archive_icon,
    download_icon_disabled,
    archive_icon_disabled,
    unzip_icon,
  },
})
export default class ProjectRow extends Vue {
  @Prop({ required: true }) public projects!: Project;

  async downloadReport(projectId: number, is_archive: number, status: number) {
    if (status || is_archive) {
      try {
        const response = await axios.post(
          "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/projects/getReport",
          {
            id: projectId,
          },
          {
            responseType: "blob", // указываем, что ожидаем Blob
          }
        );

        if (response.data.result) {
          // Создание Blob и URL для него
          const blob = new Blob([response.data.data], {
            type: response.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);

          // Создание "невидимой" ссылки и программный клик по ней
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "report.csv");
          document.body.appendChild(link);
          link.click();

          // Удаление "невидимой" ссылки и освобождение ресурсов
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.$message({
            type: "success",
            message: "Файл успешно скачан",
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
          message: `Ошибка при скачивании отчета: ${error}`,
        });
      }
    }
  }

  async archiveProject(projectId: number, is_archive: number, status: number) {
    if (status || is_archive) {
      const isArchive = is_archive === 1 ? 0 : 1;

      try {
        const response = await axios.post(
          "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/projects/setArchive",
          {
            id: projectId,
            is_archive: isArchive,
          }
        );
        if (response.data.result) {
          this.$message({
            type: "success",
            message: response.data.message,
          });

          this.$emit("refresh");
        } else {
          this.$message({
            type: "error",
            message: response.data.message,
          });
        }
      } catch (error) {
        // Обработка ошибок при скачивании.
        this.$message({
          type: "error",
          message: `"Ошибка при скачивании отчета: " ${error}`,
        });
      }
    }
  }
}
</script>

<style lang="scss">
.project-row {
  .el-table {
    .cell {
      display: flex !important;
      align-items: center;
      white-space: normal;
      word-break: keep-all;
    }

    i {
      display: flex;
      cursor: pointer;

      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}

.table-tooltip {
  border-color: #2f80ed !important;
}

.tooltip-content {
  display: flex;
  align-items: center;
  padding: 10px;

  .el-tooltip__popper .popper__arrow::after {
    background-color: #2f80ed !important;
  }

  span {
    color: #303133;
    margin-left: 10px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
