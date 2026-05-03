<template>
  <select :value="modelValue" @change="onChange">
    <option value="">{{ placeholder ?? '전체 대회' }}</option>
    <optgroup v-for="g in groups" :key="g.year" :label="g.year">
      <option v-for="o in g.options" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  groups: { year: string; options: { value: string | number; label: string }[] }[]
  placeholder?: string
  asNumber?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string | number] }>()

function onChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  emit('update:modelValue', props.asNumber && raw !== '' ? Number(raw) : raw)
}
</script>
