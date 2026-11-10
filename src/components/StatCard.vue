<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String,
  description: String
})
</script>

<template>
  <el-card shadow="hover" class="stat-card">
    <div class="content">
      <div>
        <p class="title">{{ title }}</p>
        <h2>{{ value }}</h2>
        <span>{{ description }}</span>
      </div>

      <div class="icon" :style="{ background: color }">
        {{ icon }}
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.stat-card {
  border-radius: 12px;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: red;
  font-size: 14px;
}

h2 {
  font-size: 28px;
  margin: 10px 0;
  color: midnightblue;
}

span {
  font-size: 12px;
  color: gray;
}

.icon {
  padding: 15px;
  border-radius: 12px;
  font-size: 25px;
  color: white;
}
</style>
