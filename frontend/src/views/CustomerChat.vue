<template>
  <div class="customer-chat">
    <div class="chat-container">
      <div class="chat-header">
        <button class="back-btn" @click="$router.push('/')">
          ← 返回
        </button>
        <h3>客户对话</h3>
        <div class="status">{{ connectionStatus }}</div>
      </div>
      
      <ChatBox
        :messages="messages"
        :current-user="currentUser"
        :typing-users="typingUsers"
        @send-message="handleSendMessage"
        @typing-start="handleTypingStart"
        @typing-stop="handleTypingStop"
        @file-upload="handleFileUpload"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import ChatBox from '@/components/ChatBox.vue'

export default {
  name: 'CustomerChat',
  components: {
    ChatBox
  },
  setup() {
    const messages = ref([
      {
        id: 1,
        content: '您好！有什么可以帮助您的吗？',
        sender: '客服小王',
        avatar: '/avatar1.png',
        timestamp: new Date(Date.now() - 300000),
        type: 'received'
      },
      {
        id: 2,
        content: '我想咨询一下产品信息',
        sender: '客户',
        avatar: '/customer-avatar.png',
        timestamp: new Date(Date.now() - 240000),
        type: 'sent'
      }
    ])
    
    const currentUser = reactive({
      id: 'customer123',
      name: '客户',
      avatar: '/customer-avatar.png'
    })
    
    const typingUsers = ref([])
    const connectionStatus = ref('已连接')
    
    const handleSendMessage = (message) => {
      messages.value.push(message)
      console.log('客户发送消息:', message)
      // TODO: 通过 Socket.io 发送消息到服务器
    }
    
    const handleTypingStart = () => {
      console.log('客户开始输入')
      // TODO: 通知客服正在输入
    }
    
    const handleTypingStop = () => {
      console.log('客户停止输入')
      // TODO: 通知客服停止输入
    }
    
    const handleFileUpload = (file) => {
      console.log('客户上传文件:', file)
      // TODO: 处理文件上传
    }
    
    return {
      messages,
      currentUser,
      typingUsers,
      connectionStatus,
      handleSendMessage,
      handleTypingStart,
      handleTypingStop,
      handleFileUpload
    }
  }
}
</script>

<style scoped>
.customer-chat {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-container {
  width: 100%;
  max-width: 1200px; /* 从 900px 增加到 1200px */
  height: calc(100vh - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #4CAF50;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-header h3 {
  margin: 0;
  flex: 1;
  text-align: center;
}

.status {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customer-chat {
    padding: 0;
  }
  
  .chat-container {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
</style>