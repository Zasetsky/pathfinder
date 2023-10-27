<template>
  <div v-loading="loading" class="projects-component">
    <div class="projects-component__title">
      <h2>
        Проекты
        <i @click="refresh"><refresh_icon /></i>
      </h2>
      <a href="https://ssd.rkrs.ru/page/app/rkrs_processes">/ Инструкция</a>
    </div>

    <el-card shadow="never">
      <div class="projects-component__info-message">
        Во время загрузки базы совершаются запросы на получение данных о
        пользователе. Стоимость одного запроса: 12 ₽
      </div>

      <p
        v-if="activeProjects.length === 0 && archivedProjects.length === 0"
        class="empty-message"
      >
        У вас нет ни одного проекта
      </p>

      <el-button
        v-if="activeProjects.length === 0 && archivedProjects.length === 0"
        style="border: none; font-family: 'Roboto'"
        type="primary"
        plain
        @click="openCreateProjectDialog"
        >+ Создать проект</el-button
      >

      <!-- Контент -->

      <div v-if="activeProjects.length > 0 || archivedProjects.length > 0">
        <el-tabs v-model="activeTab" @tab-click="handleTabChange">
          <el-tab-pane label="Активные" name="active">
            <project-row
              :projects="activeProjects"
              v-loading="tabLoading"
              @refresh="refresh"
            />
          </el-tab-pane>
          <el-tab-pane label="Архивные" name="archive">
            <project-row
              :projects="archivedProjects"
              v-loading="tabLoading"
              @refresh="refresh"
            />
          </el-tab-pane>
        </el-tabs>

        <div class="projects-component__footer">
          <el-pagination
            v-if="pagination.total >= 10"
            @current-change="handlePageChange"
            :current-page="pagination.current_page"
            :page-size="pagination.limit_page"
            layout="prev, pager, next, jumper"
            :total="pagination.total"
          />

          <div
            style="
              display: flex;
              font-family: 'Roboto';
              justify-content: flex-end;
              width: 100%;
            "
          ></div>
          <el-button
            v-if="activeProjects.length > 0 || archivedProjects.length > 0"
            type="primary"
            @click="openCreateProjectDialog"
            >+ Создать проект</el-button
          >
        </div>
      </div>
      <!-- Диалоговое окно -->
      <el-dialog
        :modal-append-to-body="false"
        :visible.sync="isDialogVisible"
        title="Создать новый проект"
      >
        <create-project-dialog
          :pipelines="pipelines"
          :tags="tags"
          :responsibles="responsibles"
          @close-dialog="closeDialog"
        />
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CreateProjectDialog from "./CreateProjectDialog.vue";
import ProjectRow from "./ProjectRow.vue";
import { Project, Pagination, Responsible, Tag } from "./project.types";
import axios from "axios";
import { refresh_icon } from "../../assets/icons/index";

@Component({
  components: {
    CreateProjectDialog,
    ProjectRow,
    refresh_icon,
  },
})
export default class ProjectComponent extends Vue {
  public isDialogVisible = false;
  public activeTab = "active";
  public activeProjects: Project[] = [];
  public archivedProjects: Project[] = [];
  public pagination: Pagination = {
    count: 0,
    total: 0,
    limit_page: 10,
    current_page: 1,
  };
  public loading = false;
  public pipelines = [];
  public responsibles: Responsible[] = [];
  public tags: Tag[] = [];
  public tabLoading = false;

  async created() {
    this.loading = true;
    await this.fetchResponsibles();
    await this.fetchPipelines();
    await this.fetchTags();
    await this.fetchProjects();
    this.loading = false;
  }

  async refresh() {
    this.loading = true;
    await this.fetchResponsibles();
    await this.fetchPipelines();
    await this.fetchTags();
    await this.fetchProjects();
    this.loading = false;
  }

  async fetchResponsibles() {
    try {
      const { data } = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/list/getEmployees"
      );
      this.responsibles = data.data;
    } catch (error) {
      console.error("Ошибка при получении списка ответственных:", error);
    }
  }

  async fetchPipelines() {
    try {
      const { data } = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/list/getPipelines"
      );
      this.pipelines = data.data;
    } catch (error) {
      console.error("Ошибка при получении списка воронок:", error);
    }
  }

  async fetchTags() {
    try {
      const { data } = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/list/getTags"
      );
      this.tags = data.data;
    } catch (error) {
      console.error("Ошибка при получении списка тэгов:", error);
    }
  }

  public openCreateProjectDialog() {
    this.isDialogVisible = true;
  }

  public closeDialog() {
    this.isDialogVisible = false;
  }

  public async fetchProjects() {
    try {
      const fetchActiveProjects = axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/projects/get",
        {
          page: this.pagination.current_page,
          is_archive: 0, // для активных проектов
        }
      );

      const fetchArchivedProjects = axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/projects/get",
        {
          page: this.pagination.current_page,
          is_archive: 1, // для архивных проектов
        }
      );

      // Дождемся ответов от обоих запросов
      const [activeProjectsResponse, archivedProjectsResponse] =
        await Promise.all([fetchActiveProjects, fetchArchivedProjects]);

      // Обработаем ответы
      if (activeProjectsResponse.data.result) {
        this.activeProjects = activeProjectsResponse.data.data;
        if (this.activeTab === "active") {
          this.pagination = activeProjectsResponse.data.pagination;
        }
      } else {
        console.error(
          "Ошибка загрузки активных проектов:",
          activeProjectsResponse.data.message
        );
      }

      if (archivedProjectsResponse.data.result) {
        this.archivedProjects = archivedProjectsResponse.data.data;
        if (this.activeTab === "archive") {
          this.pagination = archivedProjectsResponse.data.pagination;
        }
      } else {
        console.error(
          "Ошибка загрузки архивных проектов:",
          archivedProjectsResponse.data.message
        );
      }
    } catch (error) {
      console.error("Произошла ошибка при загрузке проектов:", error);
    }
  }

  public async handleTabChange() {
    this.tabLoading = true;
    await this.fetchProjects();
    this.tabLoading = false;
  }

  public async handlePageChange(newPage: number) {
    this.pagination.current_page = newPage;

    this.tabLoading = true;
    await this.fetchProjects();
    this.tabLoading = false;
  }
}
</script>

<style lang="scss">
.projects-component {
  font-family: "Roboto";
  margin-top: 40px;

  &__title {
    display: flex;
    align-items: baseline;
    background: #e8eeef;
    padding: 20px;

    h2 {
      display: flex;
      align-items: center;
      margin: 0;
      font-size: 16px;
      color: #303133;

      i {
        display: flex;
        flex-direction: row;
        margin-left: 4px;
        cursor: pointer;
      }
    }

    a {
      text-decoration: none;
      color: #2f80ed;
      margin-left: 5px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .el-card {
    border-radius: 0 0 4px 4px;

    &__body {
      padding: 30px 20px;
    }
  }

  &__info-message {
    background: #f5f7fa;
    color: #606266;
    padding: 12px;
    font-family: "Roboto";
    font-size: 12px;
    margin-bottom: 30px;
    border-radius: 4px;
    font-weight: 400;
  }

  .empty-message {
    color: #606266;
    font-family: "Roboto";
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 10px;
  }

  .el-dialog {
    max-width: 500px;

    &__wrapper {
      margin: -100px;
    }

    &__title {
      color: white;
    }
    &__header {
      display: flex;
      align-items: center;
      background-color: #17505b;
    }

    &__body {
      padding: 0;
    }
  }
  .el-dialog__headerbtn .el-dialog__close {
    color: #8ba8ad;
    &:hover {
      color: white;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: 16px;

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
}
</style>
