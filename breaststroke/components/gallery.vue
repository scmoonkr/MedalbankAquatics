<template>
  <section class="content-section">
    <div class="container">
      <h2 class="headline">{{ headline }}</h2>
      <p class="description">{{ description }}</p>

      <div class="photo-grid">
        <div v-for="(photo, index) in photos" :key="index" class="photo-item" :class="photo.class">
          <img :src="photo.src" :alt="photo.alt" class="photo-image">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BuddhistContentSection',
  props: {
    headline: {
      type: String,
      default: 'Add A Succinct Headline'
    },
    description: {
      type: String,
      default: 'Write with clear, concise language to inform and engage your audience. Consider what matters to them and provide valuable insights.'
    },
    photos: {
      type: Array,
      default: () => [
        {
          src: '/images/monk-portrait.jpg',
          alt: 'Buddhist monk in orange robe',
          class: 'large'
        },
        {
          src: '/images/media-crowd.jpg',
          alt: 'Media crowd with cameras',
          class: 'large'
        },
        {
          src: '/images/night-celebration.jpg',
          alt: 'Night celebration with lights',
          class: 'large'
        },
        {
          src: '/images/cultural-ceremony.jpg',
          alt: 'Cultural ceremony with monks',
          class: 'large'
        },
        {
          src: '/images/elder-monk.jpg',
          alt: 'Elder Buddhist monk',
          class: 'small'
        },
        {
          src: '/images/monks-walking.jpg',
          alt: 'Buddhist monks walking',
          class: 'small'
        }
      ]
    }
  }
}
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<style scoped>
.content-section {
  background-color: #cde0ff;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.headline {
  color: #32005c;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.description {
  color: #333;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
  font-size: 16px;
  line-height: 1.5;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 16px;
  margin-bottom: 20px;
}

.photo-item {
  overflow: hidden;
  border-radius: 6px;
}

.photo-item.large {
  grid-column: span 6;
}

.photo-item.small {
  grid-column: span 3;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .photo-item.large {
    grid-column: span 12;
  }

  .photo-item.small {
    grid-column: span 6;
  }
}

@media (max-width: 480px) {
  .photo-item.small {
    grid-column: span 12;
  }
}
</style>