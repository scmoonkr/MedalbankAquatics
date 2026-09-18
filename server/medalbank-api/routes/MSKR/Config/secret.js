// 이식 시 실제 자격증명은 모두 제거했다(레포에 커밋 금지).
// 필요한 값은 배포 환경변수로 주입하거나 로컬에서만 채워 쓴다. 구조만 유지한다.
module.exports = {
  'secret': process.env.APP_SECRET || '',
  'db_info': {
    local: { host: '', port: '', user: '', password: '', database: '' },
    real:  { host: '', port: '', user: '', password: '', database: '' },
    dev:   { host: '', port: '', user: '', password: '', database: '' }
  },
  smugmug: {
    APIKey: process.env.SMUGMUG_API_KEY || '',
    APISecret: process.env.SMUGMUG_API_SECRET || '',
    accessToken: process.env.SMUGMUG_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.SMUGMUG_ACCESS_TOKEN_SECRET || '',
    albumKey: '',
    callback_url: 'http://localhost:6600/smugmug/callback',
  },
  federation: {
    naver:    { client_id: '', secret_id: '', callback_url: '/login/naver/callback' },
    facebook: { client_id: '', secret_id: '', callback_url: '/login/facebook/callback' },
    kakao: {
      client_id: '', client_security: '',
      requestTokenURL: 'https://kauth.kakao.com/oauth/token',
      requestTokenMeURL: 'https://kapi.kakao.com/v2/user/me?secure_resource=true',
      callback_url: 'http://localhost:8080/account/kakaoCallback',
    },
    'kakaoOld': { 'client_id': '', 'client_security': '', 'callback_url': 'http://localhost:3300/login/kakao/callback' },
  },
  chatGPT: {
    dongnebookApiKey: process.env.OPENAI_API_KEY || '',
  },
};
