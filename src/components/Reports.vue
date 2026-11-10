<script setup>
import { ref, computed, onMounted } from 'vue'
const books = ref([])
const members = ref([])
const borrowings = ref([])
const returns = ref([])
const search = ref('')
const statusFilter = ref('All')
function todayDate() {
  const today = new Date()
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')
}
function loadData() {
  books.value = JSON.parse(localStorage.getItem('books') || '[]')
  members.value = JSON.parse(localStorage.getItem('members') || '[]')
  borrowings.value = JSON.parse(localStorage.getItem('borrowings') || '[]')
  returns.value = JSON.parse(localStorage.getItem('returns') || '[]')
}
onMounted(loadData)
const totalBooks = computed(() => books.value.length)
const totalStock = computed(() =>
  books.value.reduce((total, book) => {
    return total + Number(book.stock || 0)
  }, 0)
)
const totalMembers = computed(() => members.value.length)
const totalBorrowed = computed(() =>
  borrowings.value.filter(item =>
    getStatus(item) === 'Borrowed'
  ).length
)
const totalReturned = computed(() => returns.value.length)
const totalOverdue = computed(() =>
  borrowings.value.filter(item =>
    getStatus(item) === 'Overdue'
  ).length
)
function getStatus(item) {
  if (item.status === 'Returned') return 'Returned'

  if (item.dueDate && item.dueDate < todayDate()) {
    return 'Overdue'
  }
  return 'Borrowed'
}
const history = computed(() => {
  const activeRecords = borrowings.value.map(item => ({
    ...item,
    status: getStatus(item),
    returnDate: '-'
  }))
  const returnedRecords = returns.value.map(item => ({
    ...item,
    status: 'Returned'
  }))

  return [...activeRecords, ...returnedRecords]
    .sort((a, b) => Number(b.id) - Number(a.id))
})
const filteredHistory = computed(() => {
  return history.value.filter(item => {
    const keyword = search.value.toLowerCase()

    const matchSearch =
      String(item.member || '').toLowerCase().includes(keyword) ||
      String(item.book || '').toLowerCase().includes(keyword)

    const matchStatus =
      statusFilter.value === 'All' ||
      item.status === statusFilter.value

    return matchSearch && matchStatus
  })
})

const stats = computed(() => [
  {
    title: 'Total Books',
    value: totalBooks.value,
    icon: 'Reading',
    color: '#409EFF'
  },
  {
    title: 'Total Members',
    value: totalMembers.value,
    icon: 'User',
    color: '#67C23A'
  },
  {
    title: 'Total Borrowed',
    value: totalBorrowed.value,
    icon: 'Collection',
    color: '#E6A23C'
  },
  {
    title: 'Total Returned',
    value: totalReturned.value,
    icon: 'Finished',
    color: '#13C2C2'
  },
  {
    title: 'Overdue Books',
    value: totalOverdue.value,
    icon: 'Warning',
    color: '#F56C6C'
  }
])
function exportCSV() {
  const headers = [
    'ID',
    'Member',
    'Book',
    'Borrow Date',
    'Due Date',
    'Return Date',
    'Status'
  ]
  const rows = filteredHistory.value.map(item => [
    item.id,
    item.member,
    item.book,
    item.borrowDate,
    item.dueDate,
    item.returnDate || '-',
    item.status
  ])
  const escapeCSV = value =>
    `"${String(value ?? '').replace(/"/g, '""')}"`

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n')

  const blob = new Blob(
    ['\uFEFF' + csv],
    { type: 'text/csv;charset=utf-8;' }
  )
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Library-Report.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function refreshReport() {
  loadData()
}
</script>
<template>
  <div class="reports-page">

    <div class="header">
      <div>
        <h2>Library Reports</h2>
        <p>View library statistics and borrowing reports</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshReport">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
        <el-button type="success" @click="exportCSV">
          <el-icon><Download /></el-icon>
          Export CSV
        </el-button>
      </div>
    </div>
    <el-row :gutter="20">
      <el-col
        v-for="item in stats"
        :key="item.title"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        :xl="5" >
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div>
              <p>{{ item.title }}</p>
              <h2>{{ item.value }}</h2>
            </div>

            <div
              class="stat-icon"
              :style="{ background: item.color }" >
              <el-icon size="25" color="white">
                <component :is="item.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="summary">

      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <div class="summary-item">
            <div>
              <h3>Total Book Titles</h3>
              <p>Number of different books</p>
            </div>
            <h1>{{ totalBooks }}</h1>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <div class="summary-item">
            <div>
              <h3>Total Stock</h3>
              <p>Total physical book copies</p>
            </div>
            <h1>{{ totalStock }}</h1>
          </div>
        </el-card>
      </el-col>

    </el-row>

    <!-- Borrowing History -->
    <el-card shadow="hover" class="history-card">

      <template #header>
        <div class="card-header">
          <div>
            <h3>Borrowing History</h3>
            <p>All borrowing and returning records</p>
          </div>

          <el-tag type="primary">
            {{ filteredHistory.length }} Records
          </el-tag>
        </div>
      </template>

      <!-- Search and Filter -->
      <div class="filters">

        <el-input
          v-model="search"
          placeholder="Search member or book..."
          clearable
          style="max-width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="Filter Status"
          style="width: 180px"
        >
          <el-option label="All Status" value="All" />
          <el-option label="Borrowed" value="Borrowed" />
          <el-option label="Returned" value="Returned" />
          <el-option label="Overdue" value="Overdue" />
        </el-select>

      </div>

      <!-- Table -->
      <el-table
        :data="filteredHistory"
        stripe
        style="width: 100%"
      >

        <el-table-column
          prop="id"
          label="ID"
          min-width="80"
        />

        <el-table-column
          prop="member"
          label="Member"
          min-width="150"
        />

        <el-table-column
          prop="book"
          label="Book"
          min-width="180"
        />

        <el-table-column
          prop="borrowDate"
          label="Borrow Date"
          min-width="140"
        />

        <el-table-column
          prop="dueDate"
          label="Due Date"
          min-width="140"
        />

        <el-table-column
          prop="returnDate"
          label="Return Date"
          min-width="140"
        />

        <el-table-column
          label="Status"
          min-width="120"
        >
          <template #default="scope">

            <el-tag
              :type="
                scope.row.status === 'Returned'
                  ? 'success'
                  : scope.row.status === 'Overdue'
                    ? 'danger'
                    : 'warning'
              "
            >
              {{ scope.row.status }}
            </el-tag>

          </template>
        </el-table-column>

      </el-table>

      <el-empty
        v-if="filteredHistory.length === 0"
        description="No report records found"
      />

    </el-card>

  </div>
</template>

<style scoped>
.reports-page {
  padding: 25px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h2 {
  color: midnightblue;
  margin: 0 0 8px;
}

.header p {
  color: gray;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content p {
  color: gray;
  font-size: 14px;
}

.stat-content h2 {
  color: mediumblue;
  font-size: 28px;
  margin: 10px 0 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.summary {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
}

.summary-item h3 {
  color: midnightblue;
  margin: 0 0 8px;
}

.summary-item p {
  color: gray;
  margin: 0;
  font-size: 13px;
}

.summary-item h1 {
  color: #409EFF;
  font-size: 32px;
}

.history-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.card-header h3 {
  margin: 0 0 8px;
  color: midnightblue;
}

.card-header p {
  margin: 0;
  color: gray;
  font-size: 13px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .reports-page {
    padding: 15px;
  }
}
</style>
