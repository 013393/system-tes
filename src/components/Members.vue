
<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const dialogVisible = ref(false)
const editId = ref(null)

const members = ref(
  JSON.parse(localStorage.getItem('members')) || [
    { id: 1, name: 'Sok Dara', email: 'dara@gmail.com', phone: '012345678', status: 'Active' },
    { id: 2, name: 'Nita', email: 'nita@gmail.com', phone: '098765432', status: 'Active' },
    { id: 3, name: 'Dara Kim', email: 'kim@gmail.com', phone: '011223344', status: 'Inactive' }
  ]
)

const form = ref({
  name: '',
  email: '',
  phone: '',
  status: 'Active'
})

const filteredMembers = computed(() => {
  return members.value.filter(member =>
    member.name.toLowerCase().includes(search.value.toLowerCase()) ||
    member.email.toLowerCase().includes(search.value.toLowerCase())
  )
})

function openAdd() {
  editId.value = null
  form.value = {
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  }
  dialogVisible.value = true
}

function editMember(member) {
  editId.value = member.id
  form.value = { ...member }
  dialogVisible.value = true
}

function saveMember() {
  if (!form.value.name || !form.value.email) return

  if (editId.value !== null) {
    const index = members.value.findIndex(
      member => member.id === editId.value
    )

    members.value[index] = {
      ...form.value,
      id: editId.value
    }
  } else {
    members.value.push({
      ...form.value,
      id: Math.max(0, ...members.value.map(member => member.id)) + 1
    })
  }

  localStorage.setItem('members', JSON.stringify(members.value))

  dialogVisible.value = false
}

function deleteMember(id) {
  members.value = members.value.filter(member => member.id !== id)
  localStorage.setItem('members', JSON.stringify(members.value))
}
</script>

<template>
  <div class="members-page">
    <div class="header">
      <div>
        <h2>Members Management</h2>
        <p>Manage library members</p>
      </div>

      <el-button type="primary" @click="openAdd">
        + Add Member
      </el-button>
    </div>

    <el-card>
      <el-input
        v-model="search"
        placeholder="Search member..."
        clearable
        style="max-width: 350px; margin-bottom: 20px"
      />

      <el-table :data="filteredMembers" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="Full Name" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="phone" label="Phone" />

        <el-table-column label="Status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Active' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="160">
          <template #default="scope">
            <el-button size="small" @click="editMember(scope.row)">
              Edit
            </el-button>

            <el-button
              size="small"
              type="danger"
              @click="deleteMember(scope.row.id)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
   
<el-dialog
  v-model="dialogVisible"
  :title="editId !== null ? 'Edit Member' : 'Add New Member'"
  width="450px"
>
  <el-form label-position="top">
    <el-form-item label="Full Name">
      <el-input v-model="form.name" placeholder="Enter full name" />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model="form.email" placeholder="Enter email" />
    </el-form-item>
    <el-form-item label="Phone">
      <el-input v-model="form.phone" placeholder="Enter phone number" />
    </el-form-item>
    <el-form-item label="Status">
      <el-select v-model="form.status" style="width: 100%">
        <el-option label="Active" value="Active" />
        <el-option label="Inactive" value="Inactive" />
      </el-select>
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="dialogVisible = false">Cancel</el-button>
    <el-button type="primary" @click="saveMember">Save</el-button>
  </template>
</el-dialog>
  </div>
</template>

<style scoped>
.members-page {
  padding: 25px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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
</style>
