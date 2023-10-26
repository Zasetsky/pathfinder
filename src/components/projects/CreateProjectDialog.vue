<template>
  <div class="dialog-window">
    <div class="dialog-window__body">
      <!-- Карточка Загрузка базы -->
      <h3>Загрузка базы</h3>
      <el-card shadow="never">
        <div class="dialog-window__download-base">
          <el-tooltip
            popper-class="dialog-tooltip"
            effect="light"
            content="В названии сделки будет использоваться название проекта"
            placement="top"
            :visible-arrow="false"
            :manual="true"
            v-model="isInputFocused"
          >
            <el-input
              v-model="name"
              placeholder="Название проекта"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            ></el-input>
          </el-tooltip>

          <el-cascader
            style="margin: 10px 0"
            v-model="selectedPipelines"
            :options="pipelines"
            placeholder="Выберите воронку и этап для создаваемых сделок"
          >
          </el-cascader>
          <el-tooltip
            popper-class="dialog-tooltip"
            effect="light"
            content="Вы можете назначить нескольких ответственных, тогда виджет будет распределять сделки по принципу 1-2-3, 1-2-3."
            placement="top"
            :visible-arrow="false"
            :manual="true"
            v-model="isSelectFocused"
          >
            <el-select
              v-model="selectedResponsibles"
              multiple
              collapse-tags
              @focus="handleSelectFocus"
              @blur="handleSelectBlur"
              placeholder="Назначьте ответственных из списка"
            >
              <el-option
                v-for="employee in responsibles"
                :key="employee.id"
                :label="employee.name"
                :value="employee.id"
              ></el-option>
            </el-select>
          </el-tooltip>

          <a
            class="link"
            href="https://web.whatsapp.com/send?phone=79214377886"
            target="_blank"
            >Посмотреть пример базы <external_link_icon :color="'#17505B'"
          /></a>
          <el-upload
            action="#"
            :on-change="handleChange"
            :auto-upload="false"
            :file-list="fileList"
            :multiple="false"
            :before-remove="beforeRemove"
          >
            <el-button
              icon="el-icon-upload"
              style="width: 100%"
              size="small"
              type="primary"
              plain
              >Загрузить базу</el-button
            >
            <div slot="tip" class="el-upload__tip">
              Форматы: CSV, XLS, XLSX (заполнен только первый столбец
              таблицы).<br />
              Единовременно загрузить можно только 1 файл.
            </div>
          </el-upload>
        </div>
      </el-card>

      <!-- Карточка Дополнительные настройки -->
      <h3 style="margin-top: 20px">Дополнительные настройки</h3>
      <el-card shadow="never">
        <div class="dialog-window__additional">
          <el-select
            v-model="selectedTag"
            multiple
            placeholder="Выберите тег для новой сделки"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            ></el-option>
          </el-select>
          <el-checkbox style="margin-top: 20px" v-model="isSkipDuplicates"
            >Не создавать сделки, если найдены дубликаты</el-checkbox
          >
        </div>
      </el-card>
    </div>

    <div class="dialog-window__footer">
      <el-button @click="closeDialog" type="primary" plain>Отмена</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :disabled="!isFormComplete"
        >Создать</el-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Responsible, Tag } from "./project.types";
import { external_link_icon } from "../../assets/icons/index";
import axios from "axios";

@Component({
  components: {
    external_link_icon,
  },
})
export default class CreateProjectDialog extends Vue {
  @Prop({ default: () => [] }) responsibles!: Responsible[];
  @Prop({ default: () => [] }) pipelines!: any[];
  @Prop({ default: () => [] }) tags!: Tag[];

  public isVisible = false;
  public name = "";
  public selectedResponsibles: number[] = [];
  public selectedPipelines: string[] = [];
  public selectedTag: number[] = [];
  public fileList: File[] = [];
  public isInputFocused = false;
  public isSelectFocused = false;

  public isSkipDuplicates = false;

  get isFormComplete(): boolean {
    return (
      this.name.trim() !== "" &&
      this.selectedPipelines.length === 2 &&
      this.selectedResponsibles.length > 0 &&
      this.fileList.length > 0
    );
  }

  public handleChange(event: any): void {
    if (event.raw) {
      this.fileList = [event.raw];
    } else {
      console.log("Raw file не найден");
    }
  }

  public beforeRemove(file: File) {
    return this.$confirm(`Вы уверены что хотите удалить ${file.name} ?`);
  }

  public closeDialog() {
    this.$emit("close-dialog");
  }

  public handleInputFocus() {
    this.isInputFocused = true;
  }

  public handleInputBlur() {
    this.isInputFocused = false;
  }

  public handleSelectFocus() {
    this.isSelectFocused = true;
  }

  public handleSelectBlur() {
    this.isSelectFocused = false;
  }

  public async handleSubmit() {
    // Проверка, что fileList[0] действительно является файлом
    if (!(this.fileList[0] instanceof File)) {
      this.$message({
        type: "error",
        message: "Предоставленный объект не является файлом",
      });
      return;
    }

    // Создание объекта с данными
    const requestData = {
      name: this.name,
      amo_pipeline_id: this.selectedPipelines[0],
      amo_status_id: this.selectedPipelines[1],
      amo_responsible: this.selectedResponsibles,
      file_bd: this.fileList[0],
      amo_tag_id: this.selectedTag,
      can_created_leads_duplicates: this.isSkipDuplicates ? "1" : "0",
    };

    console.log(requestData);

    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/projects/created",
        requestData
      );

      if (response.data.status) {
        this.$message({
          type: "success",
          message: response.data.message,
        });

        this.selectedPipelines = [];
        this.selectedResponsibles = [];
        this.selectedTag = [];
        this.fileList = [];
        this.isSkipDuplicates = false;
        this.$emit("close-dialog");
      } else {
        this.$message({
          type: "error",
          message: response.data.message,
        });
      }
    } catch (error) {
      this.$message({
        type: "error",
        message: "Произошла ошибка при создании проекта",
      });
    }
  }
}
</script>

<style lang="scss">
.dialog-window {
  &__body {
    padding: 20px;
  }

  h3 {
    margin: 0 0 10px 0;
    font-family: "Roboto";
    font-size: 16px;
    color: #303133;
    font-weight: 500;
  }

  .el-card {
    background-color: #fafcff;
  }

  &__download-base {
    display: flex;
    flex-direction: column;

    .link {
      text-decoration: none;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-family: "Roboto";
      white-space: nowrap;
      font-size: 10px;
      font-weight: 400;
      margin-top: 20px;
      color: #17505b;
    }

    .el-upload {
      width: 100%;

      &__tip {
        color: #a8abb2;
      }
    }
  }

  &__additional {
    display: flex;
    flex-direction: column;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    border-top: 1px solid #dcdfe6;
    background-color: #fafcff;
  }
}

.dialog-tooltip {
  width: 400px;
  background-color: #f5f7fa !important;
  border-color: #dcdfe6 !important;
  margin: 50px;
  color: #909399;
}
</style>
