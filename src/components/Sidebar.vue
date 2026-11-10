<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const activeMenu = ref('dashboard')
const menus = [
  { name: 'Dashboard', id: 'dashboard', icon: 'House', path: '/' },
  { name: 'Books', id: 'books', icon: 'Reading', path: '/books' },
  { name: 'Members', id: 'members', icon: 'User', path: '/members' },
  { name: 'Borrowing', id: 'borrowing', icon: 'Collection', path: '/borrowing' },
  { name: 'Returns', id: 'returns', icon: 'Finished', path: '/returns' },
  { name: 'Reports', id: 'reports', icon: 'DataAnalysis', path: '/reports' },
  { name: 'Settings', id: 'settings', icon: 'Setting', path: '/settings' }
]
const handleSelect = (id) => {
  activeMenu.value = id
  const menu = menus.find(item => item.id === id)
  router.push(menu.path)
}
</script>
<template>
  <div class="sidebar">
    <div class="logo">
      <el-icon :size="28"><Reading /></el-icon>
      <h2>BookNest</h2>
    </div>
    <p class="menu-title">MAIN MENU</p>
    <el-menu
      :default-active="activeMenu"
      background-color="#172554"
      text-color="#cbd5e1"
      active-text-color="#ffffff"
      @select="handleSelect"
    >
      <el-menu-item
        v-for="menu in menus"
        :key="menu.id"
        :index="menu.id"
      >
        <el-icon>
          <component :is="menu.icon" />
        </el-icon>
        <span>{{ menu.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>
<style scoped>
.sidebar {
  width: 250px;
  min-height: 100vh;
  background: midnightblue;
  padding: 25px 15px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  padding: 10px;
  margin-bottom: 40px;
}
.logo h2 {
  font-size: 23px;
}
.menu-title {
  color: grey;
  font-size: 12px;
  padding: 0 12px;
  margin-bottom: 15px;
}
.el-menu {
  border: none;
}
</style>
