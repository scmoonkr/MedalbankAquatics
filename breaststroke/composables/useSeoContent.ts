// composables/useSeoContent.ts
import { useSeoMeta, useHead } from '#app'

// title: athleteData.value.name,
// url: route.fullPath,
// description: '평영 화이팅',
// type: 'article',
// image: athleteData.value.featured ? featured.value : "/images/brststrk_logo_meta.png",
// site_name: '평영 화이팅',

export interface SeoOptions {
	title: string
	url: string
	description: string
	type: string
	image: string
	site_name: string
	keywords: string
}

export const useSeoContent = (options: SeoOptions) => {
	console.log("useSeoContent=", options);
	options.title = options.title ?? '';
	options.url = options.url ?? '/';
	options.description = options.description ?? '평영 화이팅';
	options.image = options.image ?? "/images/brststrk_logo_meta.png";
	options.site_name = options.site_name ?? '평영';
	options.keywords = options.keywords ?? "#소속상관없이 #평영 #평영정기훈련 #평영클럽 #평영레슨 #평영스쿨 #평영학원 #평영화이팅";
	// useSeoMeta 설정
	useSeoMeta({
		title: options.title,
		ogTitle: options.title,
		description: options.description,
		ogDescription: options.description,
		ogImage: options.image,
		ogImageWidth: 1200,
		ogImageHeight: 630,
		ogUrl: options.url,
		ogType: 'article',
		ogSiteName: options.site_name,
		twitterCard: 'summary_large_image',
		twitterTitle: options.title,
		twitterDescription: options.description,
		twitterImage: options.image,
		author: options.site_name,
		keywords: options.keywords,
		robots: 'index, follow',
		ogImageAlt: options.title,
	})
	console.log("useSeoMeta:", {
		title: options.title,
		ogTitle: options.title,
		description: options.description,
		ogDescription: options.description,
		ogImage: options.image,
		ogImageWidth: 1200,
		ogImageHeight: 630,
		ogUrl: options.url,
		ogType: 'article',
		ogSiteName: options.site_name,
		twitterCard: 'summary_large_image',
		twitterTitle: options.title,
		twitterDescription: options.description,
		twitterImage: options.image,
		author: options.site_name,
		keywords: options.keywords,
		robots: 'index, follow',
		ogImageAlt: options.title,
	})

	// useHead 설정
	useHead({
		title: options.title,
		meta: [
			{ name: 'description', content: options.description },
			{ name: 'keywords', content: options.keywords },
			{ name: 'author', content: '@medalbankaquatics' },
			{ property: 'og:type', content: options.type ?? 'article' },
			{ property: 'og:title', content: options.title },
			{ property: 'og:description', content: options.description },
			{ property: 'og:image', content: options.image },
			{ property: 'og:image:width', content: '1200' },
			{ property: 'og:image:height', content: '630' },
			{ property: 'og:url', content: options.url },
			{ property: 'og:site_name', content: options.site_name },
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: options.title },
			{ name: 'twitter:description', content: options.description },
			{ name: 'twitter:image', content: options.image },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'theme-color', content: '#3B82F6' },
			{ name: 'robots', content: 'index, follow' },
			{ name: 'googlebot', content: 'index, follow' },
		],
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: options.title,
					image: options.image,
					description: options.description,
					url: options.url,
					datePublished: new Date().toISOString().slice(0, 10),
					author: {
						'@type': 'Person',
						name: '@medalbankaquatics'
					},
					publisher: {
						'@type': 'Organization',
						name: '@medalbankaquatics'
					},
					keywords: options.keywords,
				})
			}
		],
		link: [
			{ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
			{ rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
			{ rel: 'shortcut icon', href: '/favicon/favicon.ico' },
			{ rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
			{ rel: 'manifest', href: '/favicon/site.webmanifest' },
			// { rel: 'canonical', href: options.url },
			// { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon-96x96.png' },
			// { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' },
			// { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
		]
	})

	return {
		title: options.title,
		description: options.description,
		keywords: options.keywords,
		image: options.image,
	}
}