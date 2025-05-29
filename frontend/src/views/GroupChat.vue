<template>
  <div class="group-chat">
    <div class="chat-container">
      <div class="chat-header">
        <button class="back-btn" @click="$router.push('/')">
          ← 返回
        </button>
        <h3>群组对话</h3>
        <div class="online-count">在线: {{ onlineCount }}</div>
      </div>
      
      <div class="chat-content">
        <div class="sidebar">
          <h4>在线成员 ({{ onlineMembers.length }})</h4>
          <div class="member-list">
            <div 
              v-for="member in onlineMembers" 
              :key="member.id"
              class="member-item"
              :class="{ active: member.id === currentUser.id }"
            >
              <!-- 使用随机颜色头像 -->
              <div 
                class="member-avatar"
                :style="{ backgroundColor: member.avatarColor }"
              >
                {{ member.name.charAt(0) }}
              </div>
              <span class="member-name">{{ member.name }}</span>
              <span class="member-status" :class="member.status"></span>
            </div>
          </div>
        </div>
        
        <div class="chat-main">
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
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import ChatBox from '@/components/ChatBox.vue'

export default {
  name: 'GroupChat',
  components: {
    ChatBox
  },
  setup() {
    // 生成随机颜色的函数
    const generateRandomColor = () => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // 为用户生成头像颜色
    const generateUserAvatar = (name, id) => {
      // 使用用户ID作为种子，确保同一用户总是得到相同的颜色
      let hash = 0
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
      }
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
      ]
      return colors[Math.abs(hash) % colors.length]
    }

    const currentUser = reactive({
      id: 'service001',
      name: '客服小李', // 这里是实际姓名，用于生成头像等
      avatar: generateUserAvatar('客服小李', 'service001'),
      avatarColor: generateUserAvatar('客服小李', 'service001'),
      type: 'service'
    })
    
    // 在消息中显示为"我"
    const messages = ref([
      {
        id: 1,
        content: '大家好，今天的工作安排已经发到群里了',
        sender: '客服主管',
        avatar: generateUserAvatar('客服主管', 'manager1'),
        timestamp: new Date(Date.now() - 600000),
        type: 'received'
      },
      {
        id: 2,
        content: '收到，我负责上午的客户咨询',
        sender: '客服小王',
        avatar: generateUserAvatar('客服小王', 'staff1'),
        timestamp: new Date(Date.now() - 540000),
        type: 'received'
      },
      {
        id: 3,
        content: '好的，我下午值班',
        sender: '我', // 已经正确设置为"我"
        avatar: generateUserAvatar('客服小李', 'service001'),
        timestamp: new Date(Date.now() - 480000),
        type: 'sent'
      }
    ])
    
    const onlineMembers = ref([
      {
        id: 'manager1',
        name: '客服主管',
        avatarColor: generateUserAvatar('客服主管', 'manager1'),
        status: 'online'
      },
      {
        id: 'staff1',
        name: '客服小王',
        avatarColor: generateUserAvatar('客服小王', 'staff1'),
        status: 'online'
      },
      {
        id: 'service001',
        name: '客服小李',
        avatarColor: generateUserAvatar('客服小李', 'service001'),
        status: 'online'
      },
      {
        id: 'staff2',
        name: '客服小张',
        avatarColor: generateUserAvatar('客服小张', 'staff2'),
        status: 'away'
      }
    ])
    
    const typingUsers = ref([])
    const onlineCount = ref(4)
    
    const handleSendMessage = (message) => {
      messages.value.push(message)
      console.log('群组发送消息:', message)
      // TODO: 通过 Socket.io 发送消息到群组
    }
    
    const handleTypingStart = () => {
      console.log('开始输入')
      // TODO: 通知群组成员正在输入
    }
    
    const handleTypingStop = () => {
      console.log('停止输入')
      // TODO: 通知群组成员停止输入
    }
    
    const handleFileUpload = (file) => {
      console.log('群组上传文件:', file)
      // TODO: 处理文件上传
    }
    
    return {
      messages,
      currentUser,
      onlineMembers,
      typingUsers,
      onlineCount,
      handleSendMessage,
      handleTypingStart,
      handleTypingStop,
      handleFileUpload
    }
  }
}
</script>

<style scoped>
.group-chat {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-container {
  width: 100%;
  max-width: 1400px; /* 从 1200px 增加到 1400px */
  height: calc(100vh - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #2196F3;
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

.online-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

.chat-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px; /* 从 250px 增加到 280px */
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar h4 {
  margin: 0;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.9rem;
  color: #666;
}

.member-list {
  flex: 1;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.member-item:hover {
  background: #f8f9fa;
}

.member-item.active {
  background: #e3f2fd;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
}

.member-name {
  flex: 1;
  font-size: 0.9rem;
  color: #333; /* 添加深色文字 */
  font-weight: 500; /* 增加字重提高可读性 */
}

.sidebar h4 {
  margin: 0;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.9rem;
  color: #333; /* 从 #666 改为 #333，更深的颜色 */
  font-weight: 600; /* 增加字重 */
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.member-status.online {
  background: #4CAF50;
}

.member-status.away {
  background: #FF9800;
}

.member-status.offline {
  background: #9E9E9E;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-chat {
    padding: 0;
  }
  
  .chat-container {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
  }
  
  .sidebar {
    width: 220px; /* 移动端稍微调整 */
  }
}

@media (max-width: 480px) {
  .chat-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 150px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .member-list {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .member-item {
    flex-direction: column;
    min-width: 80px;
    text-align: center;
    padding: 0.5rem;
  }
  
  .member-avatar {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
}
</style>