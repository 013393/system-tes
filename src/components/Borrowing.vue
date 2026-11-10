
<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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

function getBookName(book) {
  return book.title || book.name || ''
}

function getStatus(item) {
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

  books.value = savedBooks.filter(book => {
    if (book.stock === undefined || book.stock === null) {
      return true
    }

    return Number(book.stock) > 0
  })
}

function saveBorrowings() {
  localStorage.setItem(
    'borrowings',
    JSON.stringify(borrowings.value)
  )
}

function saveBooks() {
  localStorage.setItem(
    'books',
    JSON.stringify(
      JSON.parse(localStorage.getItem('books') || '[]')
    )
  )
}

onMounted(loadData)

const filteredBorrowings = computed(() => {
  return borrowings.value.filter(item =>
    String(item.member || '').toLowerCase().includes(search.value.toLowerCase()) ||
    String(item.book || '').toLowerCase().includes(search.value.toLowerCase())
  )
})

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
    ElMessage.warning('Please fill in all fields')
    return
  }

  if (form.value.dueDate <= form.value.borrowDate) {
    ElMessage.warning('Due date must be after borrow date')
    return
  }

  const savedBooks = JSON.parse(
    localStorage.getItem('books') || '[]'
  )

  const selectedBook = savedBooks.find(
    book => getBookName(book) === form.value.book
  )

  if (!selectedBook) {
    ElMessage.error('Book not found')
    return
  }

  if (
    selectedBook.stock !== undefined &&
    selectedBook.stock !== null &&
    Number(selectedBook.stock) <= 0
  ) {
    ElMessage.error('Book is out of stock')
    return
  }

  if (
    selectedBook.stock !== undefined &&
    selectedBook.stock !== null
  ) {
    selectedBook.stock = Number(selectedBook.stock) - 1

    localStorage.setItem(
      'books',
      JSON.stringify(savedBooks)
    )
  }

  const newId = borrowings.value.length > 0
    ? Math.max(...borrowings.value.map(item => Number(item.id) || 0)) + 1
    : 1

  borrowings.value.push({
    id: newId,
    ...form.value,
    status: 'Borrowed'
  })

  saveBorrowings()
  loadData()

  dialogVisible.value = false

  ElMessage.success('Book borrowed successfully')
}

function returnBook(item) {
  ElMessageBox.confirm(
    'Are you sure you want to return this book?',
    'Return Book',
    {
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(() => {
    const returns = JSON.parse(
      localStorage.getItem('returns') || '[]'
    )

    const savedBooks = JSON.parse(
      localStorage.getItem('books') || '[]'
    )

    const selectedBook = savedBooks.find(
      book => getBookName(book) === item.book
    )

    if (selectedBook && selectedBook.stock !== undefined && selectedBook.stock !== null) {
      selectedBook.stock = Number(selectedBook.stock) + 1

      localStorage.setItem(
        'books',
        JSON.stringify(savedBooks)
      )
    }

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

    saveBorrowings()
    loadData()

    ElMessage.success('Book returned successfully')
  }).catch(() => {})
}

function deleteBorrowing(id) {
  ElMessageBox.confirm(
    'Are you sure you want to delete this borrowing record?',
    'Delete',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(() => {
    borrowings.value = borrowings.value.filter(
      item => item.id !== id
    )

    saveBorrowings()

    ElMessage.success('Record deleted')
  }).catch(() => {})
}
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

    <el-card shadow="hover">

      <el-input
        v-model="search"
        placeholder="Search member or book..."
        clearable
        style="max-width: 350px; margin-bottom: 20px"
      />

      <el-table
        :data="filteredBorrowings"
        stripe
        border
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
          min-width="160"
        />

        <el-table-column
          prop="book"
          label="Book"
          min-width="200"
        />

        <el-table-column
          prop="borrowDate"
          label="Borrow Date"
          min-width="150"
        />

        <el-table-column
          prop="dueDate"
          label="Due Date"
          min-width="150"
        />

        <el-table-column label="Status" min-width="130">
          <template #default="scope">
            <el-tag
              :type="getStatus(scope.row) === 'Overdue' ? 'danger' : 'warning'"
            >
              {{ getStatus(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="Actions"
          min-width="190"
          fixed="right"
        >
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

        <el-form-item label="Member" required>
          <el-select
            v-model="form.member"
            placeholder="Select member"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="member in members"
              :key="member.id"
              :label="member.name"
              :value="member.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Book" required>
          <el-select
            v-model="form.book"
            placeholder="Select book"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="book in books"
              :key="book.id"
              :label="getBookName(book)"
              :value="getBookName(book)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Borrow Date" required>
          <el-date-picker
            v-model="form.borrowDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Select borrow date"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Due Date" required>
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="date => form.borrowDate ? date <= new Date(form.borrowDate + 'T00:00:00') : false"
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
  color: #e6a23c;
}

@media (max-width: 768px) {
  .borrowing-page {
    padding: 15px;
  }
}
</style>
