<template>
  <div class="emoji-picker" v-show="visible">
    <div class="emoji-header">
      <span class="emoji-title">选择表情</span>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    <div class="emoji-categories">
      <button 
        v-for="category in categories" 
        :key="category.name"
        :class="{ active: activeCategory === category.name }"
        @click="activeCategory = category.name"
        class="category-btn"
      >
        {{ category.icon }}
      </button>
    </div>
    <div class="emoji-grid">
      <button 
        v-for="emoji in currentEmojis" 
        :key="emoji"
        @click="selectEmoji(emoji)"
        class="emoji-btn"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'EmojiPicker',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'close'],
  setup(props, { emit }) {
    const activeCategory = ref('smileys')
    
    const categories = ref([
      {
        name: 'smileys',
        icon: '😊',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
      },
      {
        name: 'gestures',
        icon: '👍',
        emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
      },
      {
        name: 'hearts',
        icon: '❤️',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
      },
      {
        name: 'animals',
        icon: '🐶',
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇']
      },
      {
        name: 'food',
        icon: '🍎',
        emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔']
      }
    ])
    
    const currentEmojis = computed(() => {
      const category = categories.value.find(cat => cat.name === activeCategory.value)
      return category ? category.emojis : []
    })
    
    const selectEmoji = (emoji) => {
      emit('select', emoji)
    }
    
    return {
      activeCategory,
      categories,
      currentEmojis,
      selectEmoji
    }
  }
}
</script>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 300px;
  height: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.emoji-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.emoji-categories {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.category-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  margin-right: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.category-btn:hover {
  background: #e9ecef;
}

.category-btn.active {
  background: #007bff;
  color: white;
}

.emoji-grid {
  flex: 1;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  overflow-y: auto;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: #f8f9fa;
}

.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
</style>