<template>
	<div :class="containerClass">
		<!-- TOC (목차) -->
		<div v-if="showToc && headings.length > 0" class="toc mb-6 p-4 bg-gray-100 rounded-lg">
			<h3 class="font-bold mb-3 text-sm">목차</h3>
			<ul class="space-y-1">
				<li v-for="heading in headings" :key="heading.id">
					<a
						:href="`#${heading.id}`"
						class="text-blue-600 hover:underline text-sm"
						:style="{ paddingLeft: `${(heading.level - 1) * 16}px` }">
						{{ heading.text }}
					</a>
				</li>
			</ul>
		</div>

		<!-- 콘텐츠 -->
		<div class="markdown-content prose prose-sm max-w-none" v-html="htmlContent" />

		<!-- 통계 -->
		<div v-if="showStats" class="mt-6 pt-4 border-t border-gray-300 text-sm text-gray-600">
			<div class="flex justify-between">
				<span>단어: {{ wordCount }}</span>
				<span>읽기시간: {{ readingTime }}분</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMarkdown } from '~/composables/useMarkdown'

interface Props {
	content: string
	showToc?: boolean
	showStats?: boolean
	className?: string
}

const props = withDefaults(defineProps<Props>(), {
	showToc: false,
	showStats: true,
	className: ''
})

const { toHtml, extractHeadings, getWordCount, getReadingTime } = useMarkdown()

const containerClass = computed(() => {
	return `markdown-viewer ${props.className}`
})

const htmlContent = computed(() => {
	return toHtml(props.content)
})

const headings = computed(() => {
	return extractHeadings(props.content)
})

const wordCount = computed(() => {
	return getWordCount(props.content)
})

const readingTime = computed(() => {
	return getReadingTime(props.content)
})
</script>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
	@apply font-bold mt-6 mb-3;
}

.markdown-content :deep(h1) {
	@apply text-4xl border-b-2 border-gray-300 pb-2;
}

.markdown-content :deep(h2) {
	@apply text-3xl border-b border-gray-200 pb-1;
}

.markdown-content :deep(h3) {
	@apply text-2xl;
}

.markdown-content :deep(h4) {
	@apply text-xl;
}

.markdown-content :deep(h5) {
	@apply text-lg;
}

.markdown-content :deep(h6) {
	@apply text-base;
}

.markdown-content :deep(p) {
	@apply mb-4 leading-7 text-gray-800;
}

.markdown-content :deep(ul) {
	@apply list-disc list-inside mb-4 space-y-1;
}

.markdown-content :deep(ol) {
	@apply list-decimal list-inside mb-4 space-y-1;
}

.markdown-content :deep(li) {
	@apply text-gray-800;
}

.markdown-content :deep(strong) {
	@apply font-bold;
}

.markdown-content :deep(em) {
	@apply italic;
}

.markdown-content :deep(del) {
	@apply line-through;
}

.markdown-content :deep(code) {
	@apply bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
	@apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.markdown-content :deep(pre code) {
	@apply bg-transparent text-gray-100 p-0;
}

.markdown-content :deep(blockquote) {
	@apply border-l-4 border-gray-400 pl-4 italic mb-4 text-gray-700 bg-gray-50 py-2 pr-4;
}

.markdown-content :deep(a) {
	@apply text-blue-600 hover:text-blue-800 hover:underline;
}

.markdown-content :deep(img) {
	@apply max-w-full h-auto rounded-lg mb-4 border border-gray-300;
}

.markdown-content :deep(table) {
	@apply w-full border-collapse mb-4;
}

.markdown-content :deep(thead) {
	@apply bg-gray-200;
}

.markdown-content :deep(th) {
	@apply border border-gray-300 px-4 py-2 text-left font-bold;
}

.markdown-content :deep(td) {
	@apply border border-gray-300 px-4 py-2;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
	@apply bg-gray-50;
}

.markdown-content :deep(tbody tr:hover) {
	@apply bg-gray-100;
}

.markdown-content :deep(hr) {
	@apply my-6 border-t border-gray-300;
}

/* TOC 스타일 */
.toc {
	@apply sticky top-4 max-h-96 overflow-y-auto;
}

.toc ul {
	@apply list-none m-0 p-0;
}

.toc li {
	@apply mb-0;
}

.toc a {
	@apply no-underline;
}

.toc a:hover {
	@apply underline;
}
</style>