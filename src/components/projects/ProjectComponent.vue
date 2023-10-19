<!-- <template>
  <div>
    <el-button @click="openCreateProjectDialog">Создать проект</el-button>
    <el-dialog :visible.sync="isDialogVisible" title="Создать новый проект">
      <create-project-dialog @close-dialog="closeDialog" />
    </el-dialog>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Активные" name="active">
        <project-row
          v-for="project in activeProjects"
          :key="project.id"
          :project="project"
        />
      </el-tab-pane>
      <el-tab-pane label="Архивные" name="archive">
        <project-row
          v-for="project in archivedProjects"
          :key="project.id"
          :project="project"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";
import CreateProjectDialog from "./CreateProjectDialog.vue";
import ProjectRow from "./ProjectRow.vue";

@Component({
  components: {
    CreateProjectDialog,
    ProjectRow,
  },
  computed: {
    ...mapState("projectModule", ["activeProjects", "archivedProjects"]),
  },
})
export default class ProjectComponent extends Vue {
  private isDialogVisible = false;
  private activeTab = "active";

  private openCreateProjectDialog() {
    this.isDialogVisible = true;
  }

  private closeDialog() {
    this.isDialogVisible = false;
  }
}
</script> -->
