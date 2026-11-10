
<script setup>
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />

    <div class="main-content">
      <Navbar />

      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-width: 0;
  background: lavenderblush;
}

.page-content {
  padding: 25px;
}
</style>
