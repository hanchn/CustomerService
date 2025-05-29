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
        emojis: [
          '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
          '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
          '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
          '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'
        ]
      },
      {
        name: 'gestures',
        icon: '👍',
        emojis: [
          '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
          '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
          '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'
        ]
      },
      {
        name: 'hearts',
        icon: '❤️',
        emojis: [
          '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
          '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
        ]
      },
      {
        name: 'objects',
        icon: '🎉',
        emojis: [
          '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬',
          '🍫', '🍩', '🍪', '☕', '🍵', '🥤', '🍺', '🍻', '🥂', '🍷'
        ]
      }
    ])
    
    const currentEmojis = computed(() => {
      const category = categories.value.find(cat => cat.name === activeCategory.value)
      return category ? category.emojis : []
    })
    
    const selectEmoji = (emoji) => {
      emit('select', emoji)
      emit('close')
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
  bottom: 60px;
  left: 0;
  width: 320px;
  height: 280px;
  background: white;
  border: 1px solid #e9ecef;
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
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.emoji-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #495057;
}

.emoji-categories {
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.category-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;
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
  padding: 0.5rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  overflow-y: auto;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;
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