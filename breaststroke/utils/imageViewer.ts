// 1. utils/openImage.ts - 간단한 이미지 새 창 열기 함수
export const openImageWindow = (imageUrl: string, title: string = '이미지') => {
  const newWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (!newWindow) {
    alert('팝업이 차단되었습니다.')
    return null
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f0f0f0;
        }
        img {
          max-width: 100%;
          max-height: 100vh;
          display: block;
        }
      </style>
    </head>
    <body>
      <img src="${imageUrl}" alt="${title}">
    </body>
    </html>
  `
  
  newWindow.document.write(html)
  newWindow.document.close()
  
  return newWindow
}