// PM2 ecosystem — env_file로 .env 자동 로드
// 사용: pm2 start ecosystem.config.cjs  또는  pm2 reload ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name:     'medalbank-aquatics-api',
      script:   './server/index.js',
      cwd:      './server',
      env_file: '../.env',
    },
    {
      name:     'medalbank-aquatics-nuxt',
      script:   './aquatics/.output/server/index.mjs',
      cwd:      './aquatics',
      env_file: '../.env',
      env: { PORT: '6631', NODE_ENV: 'production' },
    },
    {
      name:     'medalbank-aquatics-registry',
      script:   './medalbank/.output/server/index.mjs',
      cwd:      './medalbank',
      env_file: '../.env',
      env: { PORT: '6632', NODE_ENV: 'production' },
    },
    {
      name:     'medalbank-aquatics-sse',
      script:   './sse/.output/server/index.mjs',
      cwd:      './sse',
      env_file: '../.env',
      env: { PORT: '6634', NODE_ENV: 'production' },
    },
  ],
}
