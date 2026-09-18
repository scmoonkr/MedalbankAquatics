// plugins/api.ts
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    // useFetch의 기본 URL 설정
    const fetchOptions = {
        baseURL: config.public.apiBase,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    // 전역 $api 헬퍼 제공
    return {
        provide: {
            api: {
                // 커스텀 fetch 래퍼
                async get(endpoint: string, options = {}) {
                    return useFetch(endpoint, {
                        ...fetchOptions,
                        ...options,
                        method: 'GET'
                    });
                },
                async post(endpoint: string, body: any, options = {}) {
                    const fullUrl = `${config.public.apiBase}${endpoint}`;

                    return useFetch(endpoint, {
                        ...fetchOptions,
                        ...options,
                        method: 'POST',
                        body
                    });
                }
                // PUT, DELETE 등 필요한 메서드 추가
            }
        }
    };
});