<template>
  <div class="chat-view">
    <div class="chat-header">
      <h3>客服对话</h3>
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
</template>

<script>
import { ref, reactive } from 'vue'
import ChatBox from '@/components/ChatBox.vue'

export default {
  name: 'ChatView',
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
        sender: '我',
        avatar: '/my-avatar.png',
        timestamp: new Date(Date.now() - 240000),
        type: 'sent'
      }
    ])
    
    const currentUser = reactive({
      id: 'user123',
      name: '我',
      avatar: '/my-avatar.png'
    })
    
    const typingUsers = ref([])
    const connectionStatus = ref('已连接')
    
    const handleSendMessage = (message) => {
      messages.value.push(message)
      
      // 这里可以通过 Socket.io 发送消息到服务器
      console.log('发送消息:', message)
    }
    
    const handleTypingStart = () => {
      console.log('开始输入')
      // 通知其他用户正在输入
    }
    
    const handleTypingStop = () => {
      console.log('停止输入')
      // 通知其他用户停止输入
    }
    
    const handleFileUpload = (file) => {
      console.log('上传文件:', file)
      // 处理文件上传
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
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header h3 {
  margin: 0;
  color: #333;
}

.status {
  color: #28a745;
  font-size: 14px;
}
</style>