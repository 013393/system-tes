
<script setup>
import { ref, computed, onMounted } from 'vue'

const search = ref('')
const dialogVisible = ref(false)
const editId = ref(null)

const books = ref([])

const form = ref({
  title: '',
  author: '',
  category: '',
  stock: 1
})

function loadBooks() {
  const savedBooks = localStorage.getItem('books')

  if (savedBooks !== null) {
    books.value = JSON.parse(savedBooks)
  } else {
    books.value = [
      { id: 1, title: 'JavaScript Basics', author: 'John Smith', category: 'Programming', stock: 10 },
      { id: 2, title: 'Vue.js Guide', author: 'David Lee', category: 'Programming', stock: 8 },
      { id: 3, title: 'HTML & CSS', author: 'Mary Jane', category: 'Web Design', stock: 5 }
    ]

    saveData()
  }
}

function saveData() {
  localStorage.setItem('books', JSON.stringify(books.value))
}

onMounted(() => {
  loadBooks()
})

const filteredBooks = computed(() => {
  return books.value.filter(book =>
    book.title.toLowerCase().includes(search.value.toLowerCase()) ||
    book.author.toLowerCase().includes(search.value.toLowerCase())
  )
})

function openAdd() {
  editId.value = null

  form.value = {
    title: '',
    author: '',
    category: '',
    stock: 1
  }

  dialogVisible.value = true
}

function saveBook() {
  if (!form.value.title.trim() || !form.value.author.trim()) {
    return
  }

  if (editId.value !== null) {
    const index = books.value.findIndex(
      book => book.id === editId.value
    )

    if (index !== -1) {
      books.value[index] = {
        ...form.value,
        id: editId.value
      }
    }
  } else {
    books.value.push({
      ...form.value,
      id: Date.now()
    })
  }

  saveData()
  dialogVisible.value = false
}

function editBook(book) {
  editId.value = book.id
  form.value = { ...book }
  dialogVisible.value = true
}

function deleteBook(id) {
  books.value = books.value.filter(book => book.id !== id)
  saveData()
}
</script>

<template>
  <div class="books-page">

    <div class="header">
      <div>
        <h2>Books Management</h2>
        <p>Manage your library books</p>
      </div>

      <el-button type="primary" @click="openAdd">
        + Add Book
      </el-button>
    </div>

    <el-card shadow="hover">

      <el-input
        v-model="search"
        placeholder="Search by title or author..."
        clearable
        style="max-width: 350px; margin-bottom: 20px"
      />

      <el-table
        :data="filteredBooks"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          min-width="100"
        />

        <el-table-column
          prop="title"
          label="Book Title"
          min-width="200"
        />

        <el-table-column
          prop="author"
          label="Author"
          min-width="160"
        />

        <el-table-column
          prop="category"
          label="Category"
          min-width="160"
        />

        <el-table-column
          prop="stock"
          label="Stock"
          min-width="100"
        />

        <el-table-column
          label="Actions"
          min-width="160"
          fixed="right"
        >
          <template #default="scope">

            <el-button
              size="small"
              type="primary"
              @click="editBook(scope.row)"
            >
              Edit
            </el-button>

            <el-button
              size="small"
              type="danger"
              @click="deleteBook(scope.row.id)"
            >
              Delete
            </el-button>

          </template>
        </el-table-column>

      </el-table>

      <el-empty
        v-if="filteredBooks.length === 0"
        description="No books found"
      />

    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editId !== null ? 'Edit Book' : 'Add New Book'"
      width="450px"
    >

      <el-form label-position="top">

        <el-form-item label="Book Title">
          <el-input
            v-model="form.title"
            placeholder="Enter book title"
          />
        </el-form-item>

        <el-form-item label="Author">
          <el-input
            v-model="form.author"
            placeholder="Enter author"
          />
        </el-form-item>

        <el-form-item label="Category">
          <el-input
            v-model="form.category"
            placeholder="Enter category"
          />
        </el-form-item>

        <el-form-item label="Stock">
          <el-input-number
            v-model="form.stock"
            :min="0"
          />
        </el-form-item>

      </el-form>

      <template #footer>

        <el-button @click="dialogVisible = false">
          Cancel
        </el-button>

        <el-button
          type="primary"
          @click="saveBook"
        >
          Save
        </el-button>

      </template>

    </el-dialog>

  </div>
</template>

<style scoped>
.books-page {
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
  color: midnightblue;
}

.header p {
  margin: 0;
  color: gray;
}

.el-card {
  border-radius: 12px;
}

@media (max-width: 768px) {
  .books-page {
    padding: 15px;
  }
}
</style>
