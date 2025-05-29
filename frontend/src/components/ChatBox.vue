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
            <!-- 头像部分保持不变 -->
            <div 
              v-if="typeof message.avatar === 'string' && message.avatar.startsWith('#')"
              class="avatar color-avatar"
              :style="{ backgroundColor: message.avatar }"
            >
              {{ message.sender.charAt(0) }}
            </div>
            <img 
              v-else
              :src="getAvatarUrl(message.avatar)" 
              :alt="message.sender" 
              class="avatar"
              @error="handleAvatarError"
            >
            <span class="sender-name">{{ message.sender }}</span>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">
            <!-- 使用messageType而不是type来判断消息内容类型 -->
            <div v-if="message.messageType === 'text'" v-html="message.content"></div>
            <!-- 图片消息 -->
            <div v-else-if="message.messageType === 'image'" class="media-message">
              <img :src="message.url" :alt="message.fileName" class="message-image" @click="previewImage(message.url)">
              <p class="file-name">{{ message.fileName }}</p>
            </div>
            <!-- 视频消息 -->
            <div v-else-if="message.messageType === 'video'" class="media-message">
              <video :src="message.url" controls class="message-video">
                您的浏览器不支持视频播放
              </video>
              <p class="file-name">{{ message.fileName }}</p>
            </div>
            <!-- 其他文件消息 -->
            <div v-else-if="message.messageType === 'file'" class="file-message">
              <div class="file-icon">📎</div>
              <div class="file-info">
                <p class="file-name">{{ message.fileName }}</p>
                <p class="file-size">{{ formatFileSize(message.fileSize) }}</p>
              </div>
              <button @click="downloadFile(message.url, message.fileName)" class="download-btn">下载</button>
            </div>
            <!-- 默认文本内容 -->
            <div v-else v-html="message.content"></div>
          </div>
        </div>
      </div>
      
      <!-- 正在输入提示保持不变 -->
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
    
    <!-- 文件预览区域 -->
    <div v-if="selectedFiles.length > 0" class="file-preview-container">
      <div class="preview-header">
        <span>待发送文件 ({{ selectedFiles.length }})</span>
        <button @click="clearSelectedFiles" class="clear-btn">清空</button>
      </div>
      <div class="file-preview-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview-item">
          <!-- 图片预览 -->
          <div v-if="file.type.startsWith('image/')" class="image-preview">
            <img :src="file.preview" :alt="file.name" class="preview-image">
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="removeFile(index)" class="remove-btn">×</button>
          </div>
          <!-- 视频预览 -->
          <div v-else-if="file.type.startsWith('video/')" class="video-preview">
            <video :src="file.preview" class="preview-video" muted>
              您的浏览器不支持视频预览
            </video>
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="removeFile(index)" class="remove-btn">×</button>
          </div>
          <!-- 其他文件预览 -->
          <div v-else class="file-preview">
            <div class="file-icon">📎</div>
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="removeFile(index)" class="remove-btn">×</button>
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
        <div class="emoji-container">
          <button @click="toggleEmojiPicker" title="表情" class="emoji-trigger">
            😊
          </button>
          <EmojiPicker 
            :visible="showEmojiPicker" 
            @select="insertEmoji" 
            @close="showEmojiPicker = false"
          />
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          style="display: none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          multiple
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
      
      <button class="send-button" @click="sendMessage" :disabled="!canSend && selectedFiles.length === 0">
        发送
      </button>
    </div>
    
    <!-- 图片预览模态框 -->
    <div v-if="imagePreview.show" class="image-modal" @click="closeImagePreview">
      <div class="modal-content" @click.stop>
        <img :src="imagePreview.url" :alt="imagePreview.alt" class="modal-image">
        <button @click="closeImagePreview" class="modal-close">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, watch } from 'vue'
import EmojiPicker from './EmojiPicker.vue'

export default {
  name: 'ChatBox',
  components: {
    EmojiPicker
  },
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
    const showEmojiPicker = ref(false)
    const selectedFiles = ref([])
    const imagePreview = reactive({
      show: false,
      url: '',
      alt: ''
    })
    
    let typingTimer = null
    
    // 获取头像URL，如果失败则使用默认头像
    const getAvatarUrl = (avatar) => {
      if (!avatar || avatar.startsWith('/')) {
        return props.currentUser.type === 'customer' 
          ? '/src/assets/customer-avatar.svg'
          : '/src/assets/service-avatar.svg'
      }
      return avatar
    }
    
    // 头像加载失败处理
    const handleAvatarError = (event) => {
      event.target.src = props.currentUser.type === 'customer' 
        ? '/src/assets/customer-avatar.svg'
        : '/src/assets/service-avatar.svg'
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // 预览图片
    const previewImage = (url) => {
      imagePreview.show = true
      imagePreview.url = url
      imagePreview.alt = '图片预览'
    }
    
    // 关闭图片预览
    const closeImagePreview = () => {
      imagePreview.show = false
      imagePreview.url = ''
      imagePreview.alt = ''
    }
    
    // 下载文件
    const downloadFile = (url, fileName) => {
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    // 切换表情选择器
    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }
    
    // 插入表情
    const insertEmoji = (emoji) => {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      
      const emojiNode = document.createTextNode(emoji)
      range.insertNode(emojiNode)
      
      range.setStartAfter(emojiNode)
      range.setEndAfter(emojiNode)
      selection.removeAllRanges()
      selection.addRange(range)
      
      messageInput.value.focus()
      handleInput()
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (date.toDateString() === now.toDateString()) {
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
      canSend.value = content.length > 0 || selectedFiles.value.length > 0
      
      if (!isTyping.value && content.length > 0) {
        isTyping.value = true
        emit('typing-start')
      }
      
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
    const sendMessage = async () => {
      const content = messageInput.value.innerHTML.trim()
      
      // 如果有选中的文件，发送文件消息
      if (selectedFiles.value.length > 0) {
        for (const file of selectedFiles.value) {
          const fileMessage = {
            id: Date.now() + Math.random(),
            sender: props.currentUser.name,
            avatar: props.currentUser.avatar,
            timestamp: new Date(),
            fileName: file.name,
            fileSize: file.size,
            url: file.preview,
            messageType: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'file', // 重命名为messageType
            type: 'sent' // 添加发送者类型，用于CSS样式
          }
          
          emit('send-message', fileMessage)
          emit('file-upload', file)
        }
        
        clearSelectedFiles()
      }
      
      // 如果有文本内容，发送文本消息
      if (content) {
        const textMessage = {
          id: Date.now(),
          content: content,
          sender: props.currentUser.name,
          avatar: props.currentUser.avatar,
          timestamp: new Date(),
          messageType: 'text', // 重命名为messageType
          type: 'sent' // 添加发送者类型，用于CSS样式
        }
        
        emit('send-message', textMessage)
        messageInput.value.innerHTML = ''
      }
      
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
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        // 创建文件预览
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedFiles.value.push({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            preview: e.target.result
          })
          
          // 更新发送按钮状态
          canSend.value = selectedFiles.value.length > 0 || messageInput.value.textContent.trim().length > 0
        }
        reader.readAsDataURL(file)
      })
      
      // 清空文件输入
      event.target.value = ''
    }
    
    // 移除选中的文件
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
      canSend.value = selectedFiles.value.length > 0 || messageInput.value.textContent.trim().length > 0
    }
    
    // 清空所有选中的文件
    const clearSelectedFiles = () => {
      selectedFiles.value = []
      canSend.value = messageInput.value.textContent.trim().length > 0
    }
    
    // 监听消息变化，自动滚动到底部
    watch(() => props.messages, () => {
      scrollToBottom()
    }, { deep: true })
    
    return {
      messagesContainer,
      messageInput,
      fileInput,
      isBold,
      isItalic,
      canSend,
      showEmojiPicker,
      selectedFiles,
      imagePreview,
      formatTime,
      formatFileSize,
      getTypingText,
      getAvatarUrl,
      handleAvatarError,
      previewImage,
      closeImagePreview,
      downloadFile,
      toggleEmojiPicker,
      insertEmoji,
      handleInput,
      handleKeydown,
      handleFocus,
      handleBlur,
      sendMessage,
      toggleBold,
      toggleItalic,
      handleFileSelect,
      removeFile,
      clearSelectedFiles
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
  max-width: 85%;
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: #333; /* 统一文字颜色为深色 */
}

/* 移除发送消息的特殊样式，保持和接收消息一致 */
/* .message-wrapper.sent .message-bubble {
  background: #007bff;
  color: white;
} */

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

.color-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
}

.sender-name {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #333; /* 统一发送者名称颜色 */
}

.timestamp {
  font-size: 0.7rem;
  margin-left: auto;
  color: #666; /* 统一时间戳颜色 */
}

.message-content {
  line-height: 1.4;
  word-wrap: break-word;
  color: #333; /* 统一消息内容颜色 */
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
  color: #333; /* 从 #6c757d 改为 #333，确保在白色背景下清晰可见 */
}

.typing-dots {
  margin-left: 0.5rem;
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #333; /* 从 #6c757d 改为 #333 */
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
  position: relative;
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

.emoji-container {
  position: relative;
}

.emoji-trigger {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
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
  color: #333; /* 添加深色输入文字 */
  font-size: 14px; /* 确保字体大小合适 */
}

.message-input:empty:before {
  content: attr(placeholder);
  color: #888; /* 从 #999 改为 #888，placeholder更清晰 */
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

/* 文件预览容器 */
.file-preview-container {
  border-top: 1px solid #eee;
  background: #f8f9fa;
  max-height: 200px;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #eee;
}

.clear-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.clear-btn:hover {
  background: #e3f2fd;
}

.file-preview-list {
  padding: 8px;
}

.file-preview-item {
  margin-bottom: 8px;
}

.image-preview,
.video-preview,
.file-preview {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  position: relative;
}

.preview-image,
.preview-video {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.file-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #ff3742;
}

/* 消息中的媒体内容 */
.media-message {
  max-width: 300px;
}

.message-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.file-message {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  max-width: 300px;
}

.file-message .file-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  font-size: 20px;
}

.file-message .file-info {
  flex: 1;
}

.download-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
}

.download-btn:hover {
  background: #0056b3;
}

/* 图片预览模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-preview-container {
    max-height: 150px;
  }
  
  .preview-image,
  .preview-video {
    width: 50px;
    height: 50px;
  }
  
  .file-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .media-message {
    max-width: 250px;
  }
  
  .file-message {
    max-width: 250px;
  }
}
</style>