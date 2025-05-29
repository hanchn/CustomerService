<template>
  <div class="home">
    <div class="container">
      <h1>客服系统</h1>
      <div class="nav-cards">
        <div class="nav-card" @click="$router.push('/customer-chat')">
          <div class="card-icon">💬</div>
          <h3>客户对话</h3>
          <p>一对一客户服务对话</p>
        </div>
        
        <div class="nav-card" @click="$router.push('/group-chat')">
          <div class="card-icon">👥</div>
          <h3>群组对话</h3>
          <p>客服团队内部群聊</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.nav-cards {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.nav-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.2);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.nav-card h3 {
  margin: 1rem 0;
  font-size: 1.5rem;
}

.nav-card p {
  opacity: 0.8;
  line-height: 1.5;
}
</style>