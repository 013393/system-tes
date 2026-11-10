<script setup>
import { ref, computed, onMounted } from 'vue'
const search = ref('')
const returns = ref(
  JSON.parse(localStorage.getItem('returns') || '[]')
)
const filteredReturns = computed(() => {
  return returns.value.filter(item =>
    item.member.toLowerCase().includes(search.value.toLowerCase()) ||
    item.book.toLowerCase().includes(search.value.toLowerCase())
  )
})
const returnedCount = computed(() =>
  returns.value.filter(item => item.status === 'Returned').length
)
const overdueCount = computed(() =>
  returns.value.filter(item => item.status === 'Overdue').length
)
onMounted(() => {
  returns.value = JSON.parse(localStorage.getItem('returns') || '[]')
})
</script>
<template>
  <div class="returns-page">
    <div class="header">
      <div>
        <h2>Returns Management</h2>
        <p>Manage returned books</p>
      </div>
    </div>
    <el-row :gutter="20" class="stats">
      <el-col :xs="24" :sm="12">
        <el-card>
          <p>Total Returned</p>
          <h2>{{ returnedCount }}</h2>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card>
          <p>Overdue Books</p>
          <h2>{{ overdueCount }}</h2>
        </el-card>
      </el-col>
    </el-row>
    <el-card>
      <el-input
        v-model="search"
        placeholder="Search member or book..."
        clearable
        style="max-width: 350px; margin-bottom: 20px"
      />
      <el-table :data="filteredReturns" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="member" label="Member" />
        <el-table-column prop="book" label="Book" />
        <el-table-column prop="borrowDate" label="Borrow Date" />
        <el-table-column prop="dueDate" label="Due Date" />
        <el-table-column label="Return Date">
          <template #default="scope">
            {{ scope.row.returnDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Status">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'Returned'
                  ? 'success'
                  : scope.row.status === 'Overdue'
                    ? 'danger'
                    : 'warning'" >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template #default="scope">
            <el-tag type="success">Completed</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<style scoped>
.returns-page {
  padding: 25px;
}
.header {
  margin-bottom: 25px;
}
.header h2 {
  margin: 0 0 8px;
  color: midnightblue;
}
.header p {
  margin: 0;
  color:darkgrey;
}
.stats {
  margin-bottom: 20px;
}
.stats p {
  color:darkgray;
  margin: 0;
}
.stats h2 {
  color: midnightblue;
  font-size: 28px;
  margin: 12px 0 0;
}
.el-card {
  border-radius: 12px;
}
</style>
