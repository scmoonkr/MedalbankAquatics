import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { getDB } from '../db.js'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function getSecret() {
  return process.env.CONSENT_TOKEN_SECRET ?? 'medalbank-consent-secret-change-me'
}

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig  = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyToken(token) {
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const data = token.slice(0, dot)
  const sig  = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null
  } catch {
    return null
  }
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  if (Date.now() > payload.exp) return null
  return payload
}

function makeTransport() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

function buildEmailHtml({ name, images, verifyUrl, siteUrl }) {
  const cloudBase = process.env.CLOUD_PUBLIC_URL ?? ''

  // 4열 썸네일 그리드
  const cols = 4
  const rows = []
  for (let i = 0; i < images.length; i += cols) {
    const cells = images.slice(i, i + cols).map(img => {
      const thumb = img.urls.thumb ?? ''
      const thumbUrl = thumb.startsWith('http') ? thumb : `${cloudBase}/${thumb}`
      const num = String(img.image_id).padStart(3, '0')
      return `<td width="25%" style="padding:0 4px 8px 0; vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#0d1119; height:120px; overflow:hidden;">
              <img src="${thumbUrl}" width="120" height="120" alt="#${num}"
                style="display:block; width:100%; height:120px; object-fit:cover;" />
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0 0; text-align:left; font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:13px; color:#8A8E96; letter-spacing:-0.01em;">&#8470; ${num}</td>
          </tr>
        </table>
      </td>`
    })
    while (cells.length < cols) cells.push('<td width="25%"></td>')
    rows.push(`<tr>${cells.join('')}</tr>`)
  }
  const photoGridHtml = `<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>`
  const photoCount = images.length

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>메달뱅크 아쿠아틱스 매거진·웹 출판 사용 동의</title>
  <style>
    @keyframes softGlow {
      0%   { box-shadow: 0 4px 16px rgba(56,182,255,0.25); }
      50%  { box-shadow: 0 4px 28px rgba(56,182,255,0.55), 0 0 0 4px rgba(56,182,255,0.10); }
      100% { box-shadow: 0 4px 16px rgba(56,182,255,0.25); }
    }
    .cta-btn { animation: softGlow 2.6s ease-in-out infinite; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#07090f; font-family:'Nanum Myeongjo','Noto Serif KR','Apple SD Gothic Neo',Georgia,'Times New Roman',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#07090f; padding:56px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#07090f;">

        <!-- HEADER -->
        <tr>
          <td style="padding:36px 40px 36px; text-align:left;">
            <p style="margin:0; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 00</span>
              MEDALBANK AQUATICS
            </p>
            <p style="margin:8px 0 22px; color:rgba(255,255,255,0.55); font-size:13px; font-weight:400; letter-spacing:-0.005em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">메달뱅크 아쿠아틱스</p>
            <div style="border-top:1px solid #1A1F2A; margin-bottom:24px;"></div>
            <p style="margin:0 0 12px; color:#FFFFFF; font-size:30px; font-weight:400; letter-spacing:-0.018em; line-height:1.22; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">${name}님,<br/>매거진<span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.02em;">·</span>웹 출판 사용 동의</p>
            <p style="margin:0; color:#8A8E96; font-size:14px; font-weight:400; line-height:1.7; letter-spacing:-0.005em;">아래 버튼을 눌러 동의를 완료해 주세요.</p>
          </td>
        </tr>
        <tr><td style="border-top:1px solid #1A1F2A; height:1px; font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- 발신 계기 -->
        <tr>
          <td style="padding:36px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border:1px solid rgba(56,182,255,0.18); background-color:rgba(56,182,255,0.025); padding:22px 24px;">
                  <p style="margin:0 0 8px; color:#38B6FF; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">Context &middot; 발신 계기</p>
                  <p style="margin:0; font-size:14px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
                    이 이메일은 메달뱅크 취재팀이 촬영한 대회 사진과 관련하여,
                    <span style="color:#FFFFFF;">본인</span> 또는
                    <span style="color:#FFFFFF;">법적 보호자</span>가
                    메달뱅크 아쿠아틱스 매거진 및 웹사이트 출판(게재)에 대한 사전 사용 동의를 받기 위해 발송되었습니다.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 동의의 효과 -->
        <tr>
          <td style="padding:0 40px 50px;">
            <p style="margin:0 0 22px; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 01</span>
              Effects &middot; 동의의 효과
            </p>
            <p style="margin:0 0 30px; font-size:18px; color:#FFFFFF; line-height:1.55; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">본 이메일을 통한 &ldquo;출판 사용 동의&rdquo;는 아래와 같은 효과가 있습니다.</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr>
              <td width="56" valign="top" style="padding-top:2px;"><span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:30px; font-weight:400; color:#38B6FF; letter-spacing:-0.02em; line-height:1;">01</span></td>
              <td style="font-size:14.5px; color:#8A8E96; line-height:1.78; letter-spacing:-0.005em; padding-left:4px;">선택하신 사진은 <span style="color:#FFFFFF;">메달뱅크 아쿠아틱스 실물 매거진 및 웹사이트</span>에 게재될 수 있습니다.</td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr>
              <td width="56" valign="top" style="padding-top:2px;"><span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:30px; font-weight:400; color:#38B6FF; letter-spacing:-0.02em; line-height:1;">02</span></td>
              <td style="font-size:14.5px; color:#8A8E96; line-height:1.78; letter-spacing:-0.005em; padding-left:4px;">선택하신 사진에 대하여 <span style="color:#FFFFFF;">8000px, 워터마크 없는 고화소 .jpg 파일</span>을 즉각적으로 다운로드할 수 있습니다.</td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr>
              <td width="56" valign="top" style="padding-top:2px;"><span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:30px; font-weight:400; color:#38B6FF; letter-spacing:-0.02em; line-height:1;">03</span></td>
              <td style="font-size:14.5px; color:#8A8E96; line-height:1.78; letter-spacing:-0.005em; padding-left:4px;">다운로드한 사진은 본인의 취향에 맞게 마음껏 크롭하거나 변환하여, <span style="color:#FFFFFF;">SNS에서, 비상업적인 목적 내에서</span> 자유롭게 사용할 수 있습니다.</td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="56" valign="top" style="padding-top:2px;"><span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:30px; font-weight:400; color:#C75A4D; letter-spacing:-0.02em; line-height:1;">04</span></td>
              <td style="font-size:14.5px; color:#8A8E96; line-height:1.78; letter-spacing:-0.005em; padding-left:4px;">사진의 <span style="color:#FFFFFF;">상업적 이용</span>이 필요한 경우, 사전에 메달뱅크 관련 부서로 연락해 주시기 바랍니다.</td>
            </tr></table>
          </td>
        </tr>

        <!-- 동의 대상 사진 목록 -->
        <tr>
          <td style="padding:0 40px 40px;">
            <p style="margin:0 0 22px; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 02</span>
              Photo Index &middot; 동의 대상 사진 목록
            </p>
            <p style="margin:0 0 8px; font-size:22px; font-weight:400; color:#FFFFFF; line-height:1.4; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">동의 대상 사진 목록</p>
            <p style="margin:0 0 18px; font-size:13px; color:#8A8E96; line-height:1.7; letter-spacing:-0.005em;">아래 사진들에 대해 매거진 게재 및 출판 사용 동의가 진행됩니다. 내용을 확인한 후 동의 버튼을 눌러주세요.</p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;"><tr>
              <td style="border:1px solid #1A1F2A; padding:7px 16px;">
                <span style="font-size:13px; font-weight:400; color:#FFFFFF; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif; letter-spacing:-0.005em;">총 <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:14px;">${photoCount}</span>장</span>
              </td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${photoGridHtml}</td></tr></table>
          </td>
        </tr>

        <!-- 개인정보 수집·이용 동의 -->
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 22px; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 03</span>
              Privacy &middot; 개인정보
            </p>
            <p style="margin:0 0 18px; font-size:22px; font-weight:400; color:#FFFFFF; line-height:1.4; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">개인정보 수집·이용 동의</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1A1F2A;">
              <tr>
                <td width="120" style="padding:14px 18px; font-size:10.5px; font-weight:600; color:#8A8E96; letter-spacing:0.16em; text-transform:uppercase; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; vertical-align:top; border-bottom:1px solid #1A1F2A;">수집 항목</td>
                <td style="padding:14px 18px; font-size:13.5px; color:#FFFFFF; line-height:1.7; border-bottom:1px solid #1A1F2A; vertical-align:top;">이메일 주소, 이름, 동의 일시, 동의 대상 사진 정보</td>
              </tr>
              <tr>
                <td style="padding:14px 18px; font-size:10.5px; font-weight:600; color:#8A8E96; letter-spacing:0.16em; text-transform:uppercase; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; vertical-align:top; border-bottom:1px solid #1A1F2A;">수집 목적</td>
                <td style="padding:14px 18px; font-size:13.5px; color:#FFFFFF; line-height:1.7; border-bottom:1px solid #1A1F2A; vertical-align:top;">매거진 출판 사용 동의 처리 및 기록 보관</td>
              </tr>
              <tr>
                <td style="padding:14px 18px; font-size:10.5px; font-weight:600; color:#8A8E96; letter-spacing:0.16em; text-transform:uppercase; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; vertical-align:top; border-bottom:1px solid #1A1F2A;">보유 기간</td>
                <td style="padding:14px 18px; font-size:13.5px; color:#FFFFFF; line-height:1.7; border-bottom:1px solid #1A1F2A; vertical-align:top;">동의 철회 시까지. 단, 관련 법령에 따라 일정 기간 보관될 수 있습니다.</td>
              </tr>
              <tr>
                <td style="padding:14px 18px; font-size:10.5px; font-weight:600; color:#8A8E96; letter-spacing:0.16em; text-transform:uppercase; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; vertical-align:top;">거부 권리</td>
                <td style="padding:14px 18px; font-size:13.5px; color:#FFFFFF; line-height:1.7; vertical-align:top;">동의를 거부하실 권리가 있으며, 거부 시 선택하신 사진은 매거진 인쇄에 사용되지 않으며 공개되지 않습니다.</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 본인 확인 및 허위 동의 경고 -->
        <tr>
          <td style="padding:0 40px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="border:1px solid rgba(199,90,77,0.30); background-color:rgba(199,90,77,0.04); padding:26px 26px;">
                <p style="margin:0 0 12px; color:#C75A4D; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">&#9888;&nbsp; Caution &middot; 주의</p>
                <p style="margin:0 0 16px; font-size:17px; color:#FFFFFF; line-height:1.5; letter-spacing:-0.01em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">본인 확인 및 동의 주체에 관한 안내</p>
                <p style="margin:0 0 14px; font-size:13.5px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
                  본 동의는 해당 이메일 주소의 실제 소유자, 또는 피촬영자의 <span style="color:#FFFFFF;">법적 보호자</span>가 직접 수행하여야 합니다.<br/>
                  타인의 이메일 주소를 무단으로 입력하거나, 본인인 것처럼 가장하여 동의를 수행하는 행위는 금지됩니다.
                </p>
                <p style="margin:0 0 8px; font-size:12.5px; color:#FFFFFF; font-weight:400; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">이를 위반할 경우 다음의 법적 책임이 발생할 수 있습니다.</p>
                <p style="margin:0 0 6px; font-size:12.5px; color:#8A8E96; line-height:1.85; padding-left:12px; border-left:1px solid rgba(199,90,77,0.3); letter-spacing:-0.005em;">&#12298;개인정보보호법&#12299; 제15조 위반: 타인의 개인정보 무단 수집·이용 시 5년 이하 징역 또는 5천만 원 이하 벌금</p>
                <p style="margin:0 0 6px; font-size:12.5px; color:#8A8E96; line-height:1.85; padding-left:12px; border-left:1px solid rgba(199,90,77,0.3); letter-spacing:-0.005em;">&#12298;정보통신망법&#12299; 위반: 타인 명의 동의 수행 시 형사 처벌 대상</p>
                <p style="margin:0 0 16px; font-size:12.5px; color:#8A8E96; line-height:1.85; padding-left:12px; border-left:1px solid rgba(199,90,77,0.3); letter-spacing:-0.005em;">&#12298;민법&#12299; 제750조: 타인에게 손해 발생 시 민사 손해배상 청구 대상</p>
                <p style="margin:0; font-size:12.5px; color:#8A8E96; line-height:1.85; border-top:1px solid rgba(199,90,77,0.3); padding-top:14px; letter-spacing:-0.005em;">
                  당사는 허위 동의 사실이 확인된 경우 해당 동의를 즉시 무효 처리하고, 필요 시 관련 기관에 신고할 수 있습니다.<br/>
                  위 버튼을 클릭함으로써 귀하는 본인이 해당 이메일 주소의 정당한 소유자이며, 동의 권한을 보유하고 있음을 확인합니다.
                </p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- CTA 버튼 -->
        <tr>
          <td style="padding:0 40px 14px; text-align:left;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td class="cta-btn" style="border:1px solid #38B6FF; background-color:rgba(56,182,255,0.06);">
                <a href="${verifyUrl}" style="display:inline-block; padding:18px 36px; font-size:13px; font-weight:400; color:#8A8E96; text-decoration:none; letter-spacing:-0.005em; line-height:1.6; text-align:left; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">
                  총 <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:14px;">${photoCount}</span>장에 대한<br/>
                  <span style="font-size:18px; font-weight:400; color:#FFFFFF; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif; display:inline-block; margin-top:6px;">출판 사진 사용 동의하기 <span style="color:#38B6FF; font-family:-apple-system,sans-serif;">→</span></span>
                </a>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 40px; text-align:left;">
            <p style="margin:14px 0 0; font-size:11.5px; color:#C75A4D; line-height:1.85; letter-spacing:-0.005em;">
              ※ 위 버튼을 누르는 즉시 사용 동의가 완료됩니다.<br/>
              본인이 아닌 자가 동의를 진행할 경우 관련 법령에 따라 법적 처벌을 받을 수 있습니다.
            </p>
          </td>
        </tr>

        <!-- 비공개 다운로드 안내 -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="border:1px solid rgba(56,182,255,0.18); background-color:rgba(56,182,255,0.025); padding:24px 26px;">
                <p style="margin:0 0 12px; color:#38B6FF; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">A Quiet Note &middot; 작은 안내</p>
                <p style="margin:0 0 16px; font-size:17px; color:#FFFFFF; line-height:1.5; letter-spacing:-0.01em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">공개 없이 사진만 받고 싶으신 분들께</p>
                <p style="margin:0 0 16px; font-size:13.5px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">사진을 공개하지 않고 개인 소장 목적으로만 받고 싶으신 마음, 충분히 이해합니다.</p>
                <p style="margin:0 0 16px; font-size:13px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em; padding-top:14px; border-top:1px solid rgba(56,182,255,0.18);">
                  메달뱅크 아쿠아틱스의 사진 서비스는 준비-출장-촬영-컬링-관리 과정 모두 전담 인력 없이, 소수의 팀원이 본업 외 시간을 할애하는 방식으로 100% 무료로 운영하고 있습니다.<br/><br/>그로 인해 현재 아직은 시간적 역량이 부족하여 개별 요청에 응해드리기 어려운 상황입니다. 진심으로 죄송합니다.
                </p>
                <p style="margin:0 0 16px; font-size:13px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em; padding-top:14px; border-top:1px solid rgba(56,182,255,0.18);">
                  이러한 한계를 조금이나마 해소하고자, 최대한 자동화된 방식으로 사진을 제공할 수 있도록 본 공개 요청 및 사전 사용 동의 서비스를 운영합니다. 부족하지만 많은 이용 부탁드립니다.
                </p>
                <p style="margin:0; font-size:13px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em; padding-top:14px; border-top:1px solid rgba(56,182,255,0.18);">
                  <span style="color:#FFFFFF; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif; font-size:14px;">대한민국 수영을 위해, 소속에 상관없이, 수영인의 마음으로만 움직이겠습니다.</span>
                </p>
              </td>
            </tr></table>
          </td>
        </tr>

        <tr><td style="padding:28px 40px 0;"><hr style="border:none; border-top:1px solid #1A1F2A; margin:0;" /></td></tr>

        <!-- 동의 효력 및 철회 안내 -->
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 22px; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 04</span>
              Effect &amp; Withdrawal &middot; 효력·철회
            </p>
            <p style="margin:0 0 18px; font-size:22px; font-weight:400; color:#FFFFFF; line-height:1.4; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">동의 효력 및 철회 안내</p>
            <p style="margin:0 0 10px; font-size:14px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
              본 동의는 동의일로부터 <span style="color:#FFFFFF;">약 90일간 유효</span>하며, 해당 기간 내에 다운로드 링크를 통해 사진을 수령하실 수 있습니다.
            </p>
            <p style="margin:0 0 16px; font-size:13.5px; color:#8A8E96; line-height:1.85; font-family:Georgia,'Times New Roman',serif; font-style:italic; letter-spacing:-0.005em;">
              동의하신 사진이 매거진 또는 웹사이트에 출판된 경우, 해당 출판물의 회수는 기술적으로 불가능할 수 있습니다. 다만 동의를 철회하시면, 동일한 사진을 추후 재출판하는 일은 없습니다. 또한 동의 철회 전 이미 다운로드된 파일의 회수는 기술적으로 불가능합니다.
            </p>
            <p style="margin:0; font-size:14px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
              동의 철회를 원하시는 경우
              <a href="mailto:press@medalbank.com" style="color:#38B6FF; text-decoration:none; border-bottom:1px solid #38B6FF;">press@medalbank.com</a>으로
              이메일 문의 주시면, 영업일 기준 <span style="color:#FFFFFF;">1~7일 이내</span>에 답변하겠습니다.
            </p>
          </td>
        </tr>

        <!-- 사진 보관 및 자동 폐기 안내 -->
        <tr>
          <td style="padding:0 40px 44px;">
            <p style="margin:0 0 22px; color:#8A8E96; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#38B6FF; letter-spacing:-0.01em; font-size:13px; margin-right:10px;">&#8470; 05</span>
              Retention &middot; 보관·폐기
            </p>
            <p style="margin:0 0 18px; font-size:22px; font-weight:400; color:#FFFFFF; line-height:1.4; letter-spacing:-0.012em; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;">사진 보관 및 자동 폐기 안내</p>
            <p style="margin:0 0 10px; font-size:14px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
              메달뱅크 아쿠아틱스가 촬영한 대회 사진 중 <span style="color:#FFFFFF;">공개 요청 또는 다운로드 요청이 없는 사진</span>은 보관 시스템 운영 정책에 따라 <span style="color:#FFFFFF;">30~90일 내 자동으로 폐기될 수 있습니다.</span>
            </p>
            <p style="margin:0; font-size:14px; color:#8A8E96; line-height:1.85; letter-spacing:-0.005em;">
              대회당 수백 장의 고화소 원본 파일을 보관·관리하는 특성상, 스토리지 운영 정책에 따라 보존 기간 경과 후에는 별도 고지 없이 자동 폐기 처리될 수 있음을 사전에 안내드립니다. 폐기 이후에는 복구가 불가능하오니, 다운로드를 희망하시는 경우 반드시 기간 내에 요청해 주시기 바랍니다.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:32px 40px 36px; text-align:left; border-top:1px solid #1A1F2A;">
            <p style="margin:0 0 8px; font-size:14px; font-weight:400; color:#FFFFFF; font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif; letter-spacing:-0.005em;">메달뱅크 아쿠아틱스</p>
            <p style="margin:0 0 16px; font-size:12px; color:#8A8E96; line-height:1.7;">
              <a href="https://www.instagram.com/medalbankaquatics" style="color:#38B6FF; text-decoration:none; border-bottom:1px solid #38B6FF;">@medalbankaquatics</a>
            </p>
            <p style="margin:0 0 8px; font-size:11px; color:#4A4D55; word-break:break-all; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
              링크가 작동하지 않으면 아래 주소를 브라우저에 붙여넣으세요:<br/>${verifyUrl}
            </p>
            <p style="margin:0; font-size:10px; color:#4A4D55; letter-spacing:0.2em; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; text-transform:uppercase;">
              &copy; 2026 Medalbank Aquatics. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}

export default function (app) {
  // POST /api/consent — DB 저장 없이 HMAC 서명 토큰을 이메일로 발송
  app.post('/api/consent', async (req, res) => {
    try {
      const { name, email, minor = false, image_ids = [], consents: consentItems = {} } = req.body

      if (!name || !email || !image_ids.length) {
        return res.status(400).json({ error: '이름, 이메일, 사진 목록은 필수입니다.' })
      }

      const token   = signToken({ name, email, minor, image_ids, consents: consentItems, exp: Date.now() + TOKEN_TTL_MS })
      const siteUrl = process.env.SITE_URL ?? 'http://localhost:6631'
      const verifyUrl = `${siteUrl}/verify?token=${token}`

      const imageDocs = await getDB().collection('images')
        .find({ image_id: { $in: image_ids } }, { projection: { _id: 0, image_id: 1, 'urls.thumb': 1 } })
        .toArray()

      const transport = makeTransport()
      await transport.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      email,
        subject: `[메달뱅크 아쿠아틱스] ${name}님, 공개 동의 인증을 완료해주세요`,
        html:    buildEmailHtml({ name, images: imageDocs, verifyUrl, siteUrl }),
      })

      res.json({ ok: true })
    } catch (e) {
      console.error('consent error:', e)
      res.status(500).json({ error: e.message })
    }
  })

  // GET /api/consent/verify/:token — 인증 링크 클릭 시 처리
  app.get('/api/consent/verify/:token', async (req, res) => {
    try {
      const { token } = req.params

      const payload = verifyToken(token)
      if (!payload) return res.status(400).json({ error: '유효하지 않거나 만료된 링크입니다.' })

      const { name, email, minor, image_ids, consents: consentItems } = payload

      // 중복 처리 방지 — 토큰 해시로 이미 처리된 요청 확인
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const logCol    = getDB().collection('consent_log')
      const existing  = await logCol.findOne({ token_hash: tokenHash })
      if (existing) {
        return res.json({ ok: true, already: true, name, athlete_id: existing.athlete_id })
      }

      const now        = new Date()
      const athleteCol = getDB().collection('athletes')

      // athlete 없으면 이 시점에 신규 생성
      let athleteDoc = await athleteCol.findOne({ email })
      if (!athleteDoc) {
        const maxDoc = await athleteCol.find({}, { projection: { athlete_id: 1 } })
          .sort({ athlete_id: -1 }).limit(1).next()
        const athleteId = (maxDoc?.athlete_id ?? 1000) + 1
        await athleteCol.insertOne({ athlete_id: athleteId, name, email, lang: 'ko', created_at: now })
        athleteDoc = { athlete_id: athleteId }
      }

      const athleteId = athleteDoc.athlete_id

      // athletes — consent_date, first_date 업데이트
      const setFields = { consent_date: now }
      if (!athleteDoc.first_date) setFields.first_date = now
      await athleteCol.updateOne({ athlete_id: athleteId }, { $set: setFields })

      // images — athlete_id, consent_date 업데이트
      const imgIds = Array.isArray(image_ids) ? image_ids.map(Number).filter(Boolean) : []
      let modifiedCount = 0
      if (imgIds.length > 0) {
        const updateResult = await getDB().collection('images').updateMany(
          { image_id: { $in: imgIds } },
          { $set: { athlete_id: athleteId, consent_date: now } }
        )
        modifiedCount = updateResult.modifiedCount
        console.log(`[consent verify] image_ids=${JSON.stringify(imgIds)} modified=${modifiedCount}`)
      } else {
        console.warn('[consent verify] image_ids is empty')
      }

      // 처리 완료 로그 기록 (중복 방지용)
      await logCol.insertOne({
        token_hash:  tokenHash,
        athlete_id:  athleteId,
        name,
        email,
        minor,
        image_ids:   imgIds,
        consents:    consentItems,
        verified_at: now,
        modified_count: modifiedCount,
      })

      res.json({ ok: true, name, image_ids: imgIds, athlete_id: athleteId, modified_count: modifiedCount })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
