
<script setup>
import { ref, computed, onMounted } from 'vue'

const dialogVisible = ref(false)
const search = ref('')

const borrowings = ref([])
const members = ref([])
const books = ref([])

const form = ref({
  member: '',
  book: '',
  borrowDate: '',
  dueDate: ''
})

function todayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getStatus(item) {
  if (item.status === 'Returned') return 'Returned'

  if (item.dueDate < todayDate()) {
    return 'Overdue'
  }

  return 'Borrowed'
}

function loadData() {
  borrowings.value = JSON.parse(
    localStorage.getItem('borrowings') || '[]'
  )

  members.value = JSON.parse(
    localStorage.getItem('members') || '[]'
  )

  const savedBooks = JSON.parse(
    localStorage.getItem('books') || '[]'
  )

  books.value = savedBooks.filter(book => Number(book.stock) > 0)
}

function saveData() {
  localStorage.setItem(
    'borrowings',
    JSON.stringify(borrowings.value)
  )
}

onMounted(loadData)

const filteredBorrowings = computed(() => {
  return borrowings.value.filter(item =>
    item.member.toLowerCase().includes(search.value.toLowerCase()) ||
    item.book.toLowerCase().includes(search.value.toLowerCase())
  )
})

function openAdd() {
  loadData()

  form.value = {
    member: '',
    book: '',
    borrowDate: todayDate(),
    dueDate: ''
  }

  dialogVisible.value = true
}

function saveBorrowing() {
  if (
    !form.value.member ||
    !form.value.book ||
    !form.value.borrowDate ||
    !form.value.dueDate
  ) {
    return
  }

  if (form.value.dueDate <= form.value.borrowDate) {
    return
  }

  const newId = borrowings.value.length > 0
    ? Math.max(...borrowings.value.map(item => Number(item.id))) + 1
    : 1

  borrowings.value.push({
    id: newId,
    ...form.value,
    status: 'Borrowed'
  })

  saveData()
  dialogVisible.value = false
}

function returnBook(item) {
  const returns = JSON.parse(
    localStorage.getItem('returns') || '[]'
  )

  returns.push({
    ...item,
    returnDate: todayDate(),
    status: 'Returned'
  })

  localStorage.setItem(
    'returns',
    JSON.stringify(returns)
  )

  borrowings.value = borrowings.value.filter(
    borrow => borrow.id !== item.id
  )

  saveData()
}

function deleteBorrowing(id) {
  borrowings.value = borrowings.value.filter(
    item => item.id !== id
  )

  saveData()
}

const totalBorrowed = computed(() =>
  borrowings.value.filter(
    item => getStatus(item) === 'Borrowed'
  ).length
)

const totalOverdue = computed(() =>
  borrowings.value.filter(
    item => getStatus(item) === 'Overdue'
  ).length
)
</script>

<template>
  <div class="borrowing-page">

    <div class="header">
      <div>
        <h2>Borrowing Management</h2>
        <p>Manage book borrowing records</p>
      </div>

      <el-button type="primary" @click="openAdd">
        + Borrow Book
      </el-button>
    </div>

    <el-row :gutter="20" class="summary">

      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <h3>Total Borrowed</h3>
          <h1>{{ totalBorrowed }}</h1>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <h3>Overdue Books</h3>
          <h1 class="overdue">{{ totalOverdue }}</h1>
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

      <el-table :data="filteredBorrowings" stripe>

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

        <el-table-column label="Status" min-width="120">
          <template #default="scope">
            <el-tag
              :type="
                getStatus(scope.row) === 'Overdue'
                  ? 'danger'
                  : getStatus(scope.row) === 'Borrowed'
                    ? 'warning'
                    : 'success'
              "
            >
              {{ getStatus(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" min-width="190" fixed="right">
          <template #default="scope">

            <el-button
              size="small"
              type="success"
              @click="returnBook(scope.row)"
            >
              Return
            </el-button>

            <el-button
              size="small"
              type="danger"
              @click="deleteBorrowing(scope.row.id)"
            >
              Delete
            </el-button>

          </template>
        </el-table-column>

      </el-table>

      <el-empty
        v-if="filteredBorrowings.length === 0"
        description="No borrowing records"
      />

    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="Borrow New Book"
      width="450px"
    >

      <el-form label-position="top">

        <el-form-item label="Member">
          <el-select
            v-model="form.member"
            placeholder="Select member"
            style="width: 100%"
          >
            <el-option
              v-for="member in members.filter(m => m.status === 'Active')"
              :key="member.id"
              :label="member.name"
              :value="member.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Book">
          <el-select
            v-model="form.book"
            placeholder="Select book"
            style="width: 100%"
          >
            <el-option
              v-for="book in books"
              :key="book.id"
              :label="book.title"
              :value="book.title"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Borrow Date">
          <el-date-picker
            v-model="form.borrowDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Select borrow date"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Due Date">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="date => date <= new Date(form.borrowDate)"
            placeholder="Select due date"
            style="width: 100%"
          />
        </el-form-item>

      </el-form>

      <template #footer>

        <el-button @click="dialogVisible = false">
          Cancel
        </el-button>

        <el-button
          type="primary"
          @click="saveBorrowing"
        >
          Save
        </el-button>

      </template>

    </el-dialog>

  </div>
</template>

<style scoped>
.borrowing-page {
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
  margin: 0 0 8px;
  color: mediumblue;
}

.header p {
  margin: 0;
  color: gray;
}

.el-card {
  border-radius: 12px;
}

.summary {
  margin-bottom: 20px;
}

.summary h3 {
  color: gray;
  font-size: 15px;
}

.summary h1 {
  color: mediumblue;
  font-size: 32px;
  margin-bottom: 5px;
}

.summary .overdue {
  color: goldenrod;
}

@media (max-width: 768px) {
  .borrowing-page {
    padding: 15px;
  }
}
</style>
