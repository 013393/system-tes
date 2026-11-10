
<template>
  <div class="navbar">
    <h3>Library Management</h3>

    <div class="profile">
      <el-avatar>L.S.N</el-avatar>
      <span>Srey Nin</span>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  height: 70px;
  background: skyblue;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  box-shadow: 0 2px 5px #ddd;
}

.navbar h3 {
  color: midnightblue;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
