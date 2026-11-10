<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Refresh,
  Reading,
  User,
  Collection,
  Clock,
  Check,
  Warning,
  TrendCharts
} from '@element-plus/icons-vue'
const books = ref([])
const members = ref([])
const borrowings = ref([])
const returns = ref([])
const activeTab = ref('top')
function loadData() {
  books.value = JSON.parse(localStorage.getItem('books') || '[]')
  members.value = JSON.parse(localStorage.getItem('members') || '[]')
  borrowings.value = JSON.parse(localStorage.getItem('borrowings') || '[]')
  returns.value = JSON.parse(localStorage.getItem('returns') || '[]')
}
onMounted(loadData)

function todayDate() {
  const today = new Date()
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')
}

function getStatus(item) {
  if (item.status === 'Returned') return 'Returned'
  if (item.dueDate && item.dueDate < todayDate()) return 'Overdue'
  return 'Borrowed'
}

const totalBooks = computed(() => books.value.length)

const totalStock = computed(() =>
  books.value.reduce((total, book) => total + Number(book.stock || 0), 0)
)

const totalMembers = computed(() => members.value.length)

const totalBorrowed = computed(() =>
  borrowings.value.filter(item => getStatus(item) === 'Borrowed').length
)

const totalReturned = computed(() =>
  returns.value.filter(item => item.status === 'Returned').length
)

const totalOverdue = computed(() =>
  borrowings.value.filter(item => getStatus(item) === 'Overdue').length
)

const overdueHistory = computed(() =>
  borrowings.value
    .filter(item => getStatus(item) === 'Overdue')
    .sort((a, b) => b.id - a.id)
)

const allHistory = computed(() => [
  ...borrowings.value.map(item => ({
    ...item,
    status: getStatus(item),
    returnDate: '-'
  })),
  ...returns.value.map(item => ({
    ...item,
    status: 'Returned'
  }))
])

const recentCheckouts = computed(() =>
  [...allHistory.value]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 7)
)

const topBooks = computed(() => {
  const counts = {}

  allHistory.value.forEach(item => {
    if (item.book) {
      counts[item.book] = (counts[item.book] || 0) + 1
    }
  })

  return Object.entries(counts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const newArrivals = computed(() =>
  [...books.value].reverse().slice(0, 5)
)

const weekStats = computed(() => {
  const days = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    const dayRecords = allHistory.value.filter(
      item => item.borrowDate === dateString
    )

    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      borrowed: dayRecords.filter(item => item.status !== 'Returned').length,
      returned: returns.value.filter(
        item => item.returnDate === dateString
      ).length
    })
  }

  return days
})

const maxWeekValue = computed(() =>
  Math.max(
    1,
    ...weekStats.value.flatMap(item => [item.borrowed, item.returned])
  )
)

function refreshDashboard() {
  loadData()
}
</script>

<template>
  <div class="dashboard">

    <div class="page-header">
      <div>
        <h2>Library Dashboard</h2>
        <p>Welcome to BookNest Library Management System</p>
      </div>

      <el-button type="primary" :icon="Refresh" @click="refreshDashboard">
        Refresh
      </el-button>
    </div>
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-top">
            <span>Borrowed Books</span>
            <el-icon color="#409EFF" size="23"><Reading /></el-icon>
          </div>
          <el-statistic :value="totalBorrowed" />
          <el-tag type="primary" size="small">Currently borrowed</el-tag>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-top">
            <span>Returned Books</span>
            <el-icon color="#67C23A" size="23"><Check /></el-icon>
          </div>
          <el-statistic :value="totalReturned" />
          <el-tag type="success" size="small">Successfully returned</el-tag>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-top">
            <span>Overdue Books</span>
            <el-icon color="#E6A23C" size="23"><Warning /></el-icon>
          </div>
          <el-statistic :value="totalOverdue" />
          <el-tag type="warning" size="small">Past due date</el-tag>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-top">
            <span>Total Books</span>
            <el-icon color="#909399" size="23"><Collection /></el-icon>
          </div>
          <el-statistic :value="totalBooks" />
          <el-tag type="info" size="small">{{ totalStock }} copies in stock</el-tag>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="content-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>Checkout Statistics</span>
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="chart-legend">
            <span><i class="dot borrowed"></i> Borrowed</span>
            <span><i class="dot returned"></i> Returned</span>
          </div>
          <div class="chart-list">
            <div v-for="day in weekStats" :key="day.label" class="chart-item">
              <span class="day-label">{{ day.label }}</span>
              <div class="chart-bars">
                <el-progress
                  :percentage="day.borrowed / maxWeekValue * 100"
                  :show-text="false"
                  :stroke-width="10"
                  color="#67C23A"
                />
                <el-progress
                  :percentage="day.returned / maxWeekValue * 100"
                  :show-text="false"
                  :stroke-width="10"
                  color="#F56C6C"
                />
              </div>

              <span class="chart-number">
                {{ day.borrowed }}/{{ day.returned }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>Overdue History</span>
              <el-tag type="danger">{{ totalOverdue }} Overdue</el-tag>
            </div>
          </template>
          <el-table :data="overdueHistory" stripe height="270">
            <el-table-column prop="id" label="ID" min-width="85" />
            <el-table-column prop="member" label="Member" min-width="120" />
            <el-table-column prop="book" label="Book Title" min-width="150" />
            <el-table-column prop="dueDate" label="Due Date" min-width="115" />
            <el-table-column label="Status" min-width="100">
              <template #default="scope">
                <el-tag type="danger" size="small">Overdue</el-tag>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="No overdue books" :image-size="65" />
            </template>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="content-row">
      <el-col :xs="24" :lg="17">
        <el-card shadow="never" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>Recent Checkouts</span>
              <el-tag type="success">Latest Records</el-tag>
            </div>
          </template>
          <el-table :data="recentCheckouts" stripe height="340">
            <el-table-column prop="id" label="ID" min-width="85" />
            <el-table-column prop="book" label="Book Title" min-width="160" />
            <el-table-column prop="member" label="Member" min-width="130" />
            <el-table-column prop="borrowDate" label="Borrow Date" min-width="120" />
            <el-table-column label="Return Date" min-width="120">
              <template #default="scope">
                {{ scope.row.returnDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="Status" min-width="105">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.status === 'Returned'
                      ? 'success'
                      : scope.row.status === 'Overdue'
                      ? 'danger'
                      : 'primary'
                  "
                  size="small"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="No checkout records" :image-size="65" />
            </template>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="7">
        <el-card shadow="never" class="dashboard-card books-card">
          <template #header>
            <span>Book Collection</span>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="Top Books" name="top">
              <div v-for="book in topBooks" :key="book.title" class="book-item">
                <div class="book-info">
                  <strong>{{ book.title }}</strong>
                  <span>{{ book.count }} checkouts</span>
                </div>
                <el-progress
                  :percentage="book.count / (topBooks[0]?.count || 1) * 100"
                  :show-text="false"
                  color="#409EFF"
                />
              </div>
              <el-empty
                v-if="topBooks.length === 0"
                description="No book records"
                :image-size="65"
              />
            </el-tab-pane>
            <el-tab-pane label="New Arrivals" name="new">
              <div v-for="book in newArrivals" :key="book.id" class="book-item">
                <div class="book-info">
                  <strong>{{ book.title }}</strong>
                  <span>{{ book.author }}</span>
                </div>
                <el-tag
                  :type="Number(book.stock) > 0 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ Number(book.stock) > 0 ? 'Available' : 'Out of Stock' }}
                </el-tag>
              </div>
              <el-empty
                v-if="newArrivals.length === 0"
                description="No books available"
                :image-size="65"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="bottom-card">
          <div class="bottom-info">
            <el-icon size="28" color="#409EFF"><User /></el-icon>
            <div>
              <span>Total Members</span>
              <h2>{{ totalMembers }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="bottom-card">
          <div class="bottom-info">
            <el-icon size="28" color="#67C23A"><Clock /></el-icon>
            <div>
              <span>Available Book Copies</span>
              <h2>{{ totalStock }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style scoped>
.dashboard {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: white;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}
.page-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  color: black;
}
.page-header p {
  margin: 0;
  color: gray;
  font-size: 13px;
}
.stats-row,
.content-row {
  margin-bottom: 16px;
}
.stat-card {
  margin-bottom: 16px;
  border: none;
  border-radius: 8px;
}
.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  color: grey;
  font-size: 13px;
}
.stat-card :deep(.el-statistic__content) {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}
.dashboard-card {
  height: 100%;
  border: none;
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: black;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 22px;
  font-size: 12px;
  color: gray;
}
.chart-legend span {
  display: flex;
  align-items: center;
  gap: 7px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.borrowed {
  background: green;
}
.returned {
  background: red;
}
.chart-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.chart-item {
  display: grid;
  grid-template-columns: 38px 1fr 45px;
  align-items: center;
  gap: 10px;
}
.day-label,
.chart-number {
  font-size: 12px;
  color: grey;
}
.chart-number {
  text-align: right;
}
.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.chart-bars :deep(.el-progress-bar__outer) {
  background: white;
}
.book-item {
  padding: 13px 0;
  border-bottom: 1px solid white;
}
.book-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 9px;
}
.book-info strong {
  font-size: 13px;
  color: black;
}
.book-info span {
  font-size: 12px;
  color: grey;
}
.bottom-card {
  margin-bottom: 16px;
  border: none;
}
.bottom-info {
  display: flex;
  align-items: center;
  gap: 18px;
}
.bottom-info span {
  font-size: 13px;
  color:gray;
}
.bottom-info h2 {
  margin: 5px 0 0;
  font-size: 25px;
}
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  .page-header h2 {
    font-size: 19px;
  }
}
</style>
