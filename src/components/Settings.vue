<script setup>
import { ref } from 'vue'
const libraryName = ref('BookNest')
const email = ref('admin@gmail.com')
const language = ref('English')

function saveSettings() {
  alert('Settings saved successfully!')
}
</script>

<template>
  <div class="settings">
    <h2>Settings</h2>
    <p>Manage your library settings</p>

    <el-card>
      <el-form label-position="top">
        <el-form-item label="Library Name">
          <el-input v-model="libraryName" />
        </el-form-item>

        <el-form-item label="Admin Email">
          <el-input v-model="email" />
        </el-form-item>

        <el-form-item label="Language">
          <el-select v-model="language">
            <el-option label="English" value="English" />
            <el-option label="Khmer" value="Khmer" />
          </el-select>
        </el-form-item>

        <el-button type="primary" @click="saveSettings">
          Save Settings
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings {
  padding: 10px;
}

.settings h2 {
  color: midnightblue;
}

.settings p {
  color: gray;
  margin-bottom: 20px;
}
</style>
