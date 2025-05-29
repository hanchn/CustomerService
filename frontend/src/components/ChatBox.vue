<template>
  <div class="chat-box">
    <!-- 消息显示区域 -->
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message-wrapper"
        :class="message.type"
      >
        <div class="message-bubble">
          <div class="message-header">
            <img :src="message.avatar" :alt="message.sender" class="avatar">
            <span class="sender-name">{{ message.sender }}</span>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content" v-html="message.content"></div>
        </div>
      </div>
      
      <!-- 正在输入提示 -->
      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-bubble">
          <span>{{ getTypingText() }}</span>
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-toolbar">
        <button @click="toggleBold" :class="{ active: isBold }" title="粗体">
          <strong>B</strong>
        </button>
        <button @click="toggleItalic" :class="{ active: isItalic }" title="斜体">
          <em>I</em>
        </button>
        <button @click="insertEmoji" title="表情">
          😊
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          style="display: none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        >
        <button @click="$refs.fileInput.click()" title="上传文件">
          📎
        </button>
      </div>
      
      <div 
        class="message-input"
        ref="messageInput"
        contenteditable="true"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
        placeholder="输入消息..."
      ></div>
      
      <button class="send-button" @click="sendMessage" :disabled="!canSend">
        发送
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, watch } from 'vue'

export default {
  name: 'ChatBox',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: Object,
      required: true
    },
    typingUsers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['send-message', 'typing-start', 'typing-stop', 'file-upload'],
  setup(props, { emit }) {
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const fileInput = ref(null)
    
    const isBold = ref(false)
    const isItalic = ref(false)
    const isTyping = ref(false)
    const canSend = ref(false)
    
    let typingTimer = null
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (date.toDateString() === now.toDateString()) { // 今天
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    }
    
    // 获取正在输入的文本
    const getTypingText = () => {
      if (props.typingUsers.length === 1) {
        return `${props.typingUsers[0].name} 正在输入`
      } else if (props.typingUsers.length > 1) {
        return `${props.typingUsers.length} 人正在输入`
      }
      return ''
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    // 处理输入
    const handleInput = () => {
      const content = messageInput.value.textContent.trim()
      canSend.value = content.length > 0
      
      if (!isTyping.value && content.length > 0) {
        isTyping.value = true
        emit('typing-start')
      }
      
      // 重置输入计时器
      clearTimeout(typingTimer)
      typingTimer = setTimeout(() => {
        if (isTyping.value) {
          isTyping.value = false
          emit('typing-stop')
        }
      }, 1000)
    }
    
    // 处理键盘事件
    const handleKeydown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }
    
    // 处理焦点
    const handleFocus = () => {
      // 可以添加焦点处理逻辑
    }
    
    const handleBlur = () => {
      if (isTyping.value) {
        isTyping.value = false
        emit('typing-stop')
      }
    }
    
    // 发送消息
    const sendMessage = () => {
      const content = messageInput.value.innerHTML.trim()
      if (!content) return
      
      const message = {
        id: Date.now(),
        content: content,
        sender: props.currentUser.name,
        avatar: props.currentUser.avatar,
        timestamp: new Date(),
        type: 'sent'
      }
      
      emit('send-message', message)
      
      // 清空输入框
      messageInput.value.innerHTML = ''
      canSend.value = false
      
      if (isTyping.value) {
        isTyping.value = false
        emit('typing-stop')
      }
    }
    
    // 切换粗体
    const toggleBold = () => {
      document.execCommand('bold')
      isBold.value = !isBold.value
      messageInput.value.focus()
    }
    
    // 切换斜体
    const toggleItalic = () => {
      document.execCommand('italic')
      isItalic.value = !isItalic.value
      messageInput.value.focus()
    }
    
    // 插入表情
    const insertEmoji = () => {
      const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🤔']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      document.execCommand('insertText', false, randomEmoji)
      messageInput.value.focus()
    }
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('file-upload', file)
        // 重置文件输入
        fileInput.value.value = ''
      }
    }
    
    // 监听消息变化，自动滚动
    watch(() => props.messages, () => {
      scrollToBottom()
    }, { deep: true })
    
    // 监听正在输入用户变化，自动滚动
    watch(() => props.typingUsers, () => {
      scrollToBottom()
    }, { deep: true })
    
    return {
      messagesContainer,
      messageInput,
      fileInput,
      isBold,
      isItalic,
      canSend,
      formatTime,
      getTypingText,
      handleInput,
      handleKeydown,
      handleFocus,
      handleBlur,
      sendMessage,
      toggleBold,
      toggleItalic,
      insertEmoji,
      handleFileSelect
    }
  }
}
</script>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.message-wrapper {
  margin-bottom: 1rem;
  display: flex;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message-wrapper.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-wrapper.sent .message-bubble {
  background: #007bff;
  color: white;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 0.5rem;
  object-fit: cover;
}

.sender-name {
  font-weight: 500;
  margin-right: 0.5rem;
}

.timestamp {
  font-size: 0.7rem;
  margin-left: auto;
}

.message-content {
  line-height: 1.4;
  word-wrap: break-word;
}

.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.typing-bubble {
  background: #e9ecef;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.typing-dots {
  margin-left: 0.5rem;
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #6c757d;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.input-container {
  border-top: 1px solid #e9ecef;
  background: white;
  padding: 1rem;
}

.input-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.input-toolbar button {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.input-toolbar button:hover {
  background: #e9ecef;
}

.input-toolbar button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.message-input {
  min-height: 60px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  outline: none;
  background: white;
}

.message-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-input:empty:before {
  content: attr(placeholder);
  color: #6c757d;
  pointer-events: none;
}

.send-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  float: right;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>