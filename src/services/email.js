/**
 * 邮件发送服务
 *
 * 发信方式（按优先级）：
 *   1. SMTP（如果 notify_config 中配置了 smtp_host）— 使用 Workers connect() API
 *   2. MailChannels（免费，Cloudflare Workers 付费计划可用，需域名 MX 指向 MailChannels）
 *
 * MailChannels 要求：
 *   - Workers 付费计划
 *   - 发信域名必须在 Cloudflare 中且 MX 解析指向 MailChannels
 */

const MAILCHANNELS_API = 'https://api.mailchannels.net/tx/v1/send'

/**
 * 发送邮件
 */
export async function sendMail(env, { to, subject, htmlContent, textContent }) {
  // 读取通知配置
  let senderEmail = 'noreply@lequ.pw'
  let senderName = 'ShouYinPOS'
  let smtpHost = null
  let smtpPort = 587
  let smtpUser = null
  let smtpPass = null

  try {
    const db = env.DB
    const row = await db.prepare("SELECT value FROM system_config WHERE key = 'notify_config'").first()
    if (row) {
      const cfg = JSON.parse(row.value)
      if (cfg.sender_email) senderEmail = cfg.sender_email
      if (cfg.sender_name) senderName = cfg.sender_name
      if (cfg.smtp_host) { smtpHost = cfg.smtp_host; smtpPort = cfg.smtp_port || 587 }
      if (cfg.smtp_user) smtpUser = cfg.smtp_user
      if (cfg.smtp_pass) smtpPass = cfg.smtp_pass
    }
  } catch (_) { /* 使用默认值 */ }

  // 配置了 SMTP 主机 → 优先 SMTP
  if (smtpHost) {
    return sendViaSMTP(env, { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass }, { to, subject, htmlContent, textContent, senderEmail, senderName })
  }

  // 未配置 SMTP → MailChannels
  return sendViaMailChannels({ to, subject, htmlContent, textContent, senderEmail, senderName })
}

/**
 * 通过 MailChannels API 发信
 */
async function sendViaMailChannels({ to, subject, htmlContent, textContent, senderEmail, senderName }) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: senderEmail, name: senderName },
    subject,
    content: [{ type: 'text/html', value: htmlContent }],
  }

  if (textContent) {
    body.content.push({ type: 'text/plain', value: textContent })
  }

  try {
    const resp = await fetch(MAILCHANNELS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (resp.status === 202 || (resp.status >= 200 && resp.status < 300)) {
      return { success: true }
    }

    const text = await resp.text()
    console.error(`MailChannels error [${resp.status}]:`, text)
    return { success: false, error: `MailChannels returned ${resp.status}: ${text}` }
  } catch (err) {
    console.error('sendViaMailChannels failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 通过 SMTP 发信
 * 使用 Cloudflare Workers connect() API 建立 TLS 连接
 * 支持 AUTH LOGIN / AUTH PLAIN，支持多行响应码
 */
async function sendViaSMTP(env, { host, port, user, pass }, { to, subject, htmlContent, textContent, senderEmail, senderName }) {
  try {
    // 获取 connect 函数
    const connect = (typeof globalThis !== 'undefined' && globalThis.connect)
      ? globalThis.connect
      : null

    if (typeof connect !== 'function') {
      return { success: false, error: 'SMTP 需要 Workers Paid 计划的 connect() API' }
    }

    const TIMEOUT_MS = 10000

    // 建立 TLS 连接
    const socket = await connect({ hostname: host, port, tls: true })

    const reader = socket.readable.getReader()
    const writer = socket.writable.getWriter()
    const encoder = new TextEncoder()
    let buffer = ''
    let closed = false

    // 带超时的读
    async function readResponse(timeoutMs = TIMEOUT_MS) {
      const deadline = Date.now() + timeoutMs
      while (!closed) {
        if (Date.now() > deadline) {
          throw new Error('SMTP 响应超时')
        }
        // 检查 buffer 中是否已有完整响应
        const nlIdx = buffer.indexOf('\r\n')
        if (nlIdx !== -1) {
          const line = buffer.slice(0, nlIdx)
          buffer = buffer.slice(nlIdx + 2)
          // SMTP 多行响应：行首 4 位数字 + '-' 表示未结束
          // 单行结束：行首 3 位数字 + ' ' 表示结束
          if (line.length >= 4 && line[3] === ' ') {
            return line
          }
          // 多行响应：跳过中间行，继续等最后一行
          // 最后一行是 3 位数字 + ' '
          if (line.length >= 4 && line[3] === '-') {
            // 继续等待后续行
            continue
          }
          return line
        }
        // 读取更多数据
        const { value, done } = await reader.read()
        if (done) { closed = true; break }
        buffer += new TextDecoder().decode(value, { stream: true })
        // 检查解码后 buffer 中是否出现 CRLF
      }
      // 最后检查 buffer
      const nlIdx = buffer.indexOf('\r\n')
      if (nlIdx !== -1) {
        const line = buffer.slice(0, nlIdx)
        buffer = buffer.slice(nlIdx + 2)
        return line
      }
      if (buffer.trim()) return buffer.trim()
      throw new Error('SMTP 连接已关闭')
    }

    async function sendCommand(cmd, timeoutMs = TIMEOUT_MS) {
      if (closed) throw new Error('SMTP 连接已关闭')
      await writer.write(encoder.encode(cmd + '\r\n'))
      return readResponse(timeoutMs)
    }

    // 读取 banner
    let resp = await readResponse(5000)

    // EHLO
    resp = await sendCommand('EHLO shouquan')

    // 如果 server 不支持 AUTH，EHLO 响应中不会包含 AUTH
    // 尝试 AUTH（如果有凭证）
    if (user && pass) {
      // 先尝试 AUTH PLAIN
      // PLAIN 格式: \0username\0password
      const authPlain = '\0' + user + '\0' + pass
      resp = await sendCommand('AUTH PLAIN ' + b64(authPlain))
      // 检查响应码：235 = 成功，其他 = 失败
      if (!resp || !resp.startsWith('235')) {
        // AUTH PLAIN 失败，尝试 AUTH LOGIN
        resp = await sendCommand('AUTH LOGIN')
        resp = await sendCommand(b64(user))
        resp = await sendCommand(b64(pass))
      }
    }

    // MAIL FROM
    await sendCommand('MAIL FROM:<' + senderEmail + '>')

    // RCPT TO
    await sendCommand('RCPT TO:<' + to + '>')

    // DATA
    resp = await sendCommand('DATA')

    // 构建邮件原文
    const raw = buildMailRaw({ to, subject, htmlContent, textContent, senderEmail, senderName })

    // 发送正文 + 结束标记 '.'
    await writer.write(encoder.encode(raw + '\r\n.\r\n'))
    resp = await readResponse(10000)

    // QUIT
    await sendCommand('QUIT')

    writer.close().catch(() => {})
    reader.cancel().catch(() => {})

    // 检查 250 OK
    if (resp && resp.startsWith('250')) {
      return { success: true }
    }
    return { success: false, error: 'SMTP 服务器拒绝: ' + (resp || 'unknown') }
  } catch (err) {
    console.error('sendViaSMTP failed:', err.message, err.stack)
    return { success: false, error: 'SMTP: ' + err.message }
  }
}

/**
 * 构建 RFC 2822 邮件原文
 */
function buildMailRaw({ to, subject, htmlContent, textContent, senderEmail, senderName }) {
  const CRLF = '\r\n'
  const boundary = '----=_Part_SY_' + Date.now() + '.' + Math.random().toString(36).slice(2, 8)
  const msgId = '<' + Date.now() + '.' + Math.random().toString(36).slice(2, 10) + '@' + (senderEmail.split('@')[1] || 'lequ.pw') + '>'

  let raw = ''
  raw += 'From: ' + encodeMimeHeader(senderName) + ' <' + senderEmail + '>' + CRLF
  raw += 'To: <' + to + '>' + CRLF
  raw += 'Subject: ' + encodeMimeHeader(subject) + CRLF
  raw += 'Message-ID: ' + msgId + CRLF
  raw += 'Date: ' + new Date().toUTCString() + CRLF
  raw += 'MIME-Version: 1.0' + CRLF
  raw += 'Content-Type: multipart/alternative; boundary="' + boundary + '"' + CRLF
  raw += CRLF
  raw += '--' + boundary + CRLF
  raw += 'Content-Type: text/plain; charset=UTF-8' + CRLF
  raw += 'Content-Transfer-Encoding: base64' + CRLF + CRLF
  raw += b64(textContent || stripHtml(htmlContent)) + CRLF
  raw += '--' + boundary + CRLF
  raw += 'Content-Type: text/html; charset=UTF-8' + CRLF
  raw += 'Content-Transfer-Encoding: base64' + CRLF + CRLF
  raw += b64(htmlContent) + CRLF
  raw += '--' + boundary + '--' + CRLF

  // SMTP DATA 要求正文行首的 '.' 需要 double-dot 编码
  // 但 multipart 内容本身不含行首 '.'，一般不需要 dot-stuffing
  return raw
}

// ==================== 辅助函数 ====================

function b64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str || '')))
  } catch (_) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str || '', 'utf-8').toString('base64')
    }
    // 最简回退
    return btoa(str || '')
  }
}

function encodeMimeHeader(text) {
  if (!text) return ''
  if (/[^\x20-\x7E]/.test(text)) {
    return '=?UTF-8?B?' + b64(text) + '?='
  }
  return text
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * 生成找回密码邮件内容
 */
export function buildResetPasswordEmail(resetUrl) {
  return {
    subject: '重置密码 - ShouYinPOS',
    htmlContent: `
      <div style="max-width:600px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">
        <div style="text-align:center;padding:20px 0;font-size:24px;font-weight:700;color:#1a1a2e">ShouYinPOS</div>
        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
          <h2 style="font-size:20px;margin:0 0 8px">重置密码</h2>
          <p style="color:#666;line-height:1.6">您收到了重置密码的请求。请点击下方链接重置密码，链接有效期 1 小时。</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">重置密码</a>
          </div>
          <p style="color:#999;font-size:13px">如果按钮无法点击，请复制以下链接到浏览器：<br><a href="${resetUrl}" style="color:#1a1a2e">${resetUrl}</a></p>
          <p style="color:#999;font-size:13px">如果您没有发起重置请求，请忽略此邮件。</p>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px">
          ShouYinPOS &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `,
    textContent: `重置密码 - ShouYinPOS\n\n您收到了重置密码的请求。请点击下方链接重置密码，链接有效期 1 小时。\n\n${resetUrl}\n\n如果您没有发起重置请求，请忽略此邮件。`,
  }
}

/**
 * 生成注册欢迎邮件
 */
export function buildWelcomeEmail(userName) {
  return {
    subject: '欢迎加入 ShouYinPOS',
    htmlContent: `
      <div style="max-width:600px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">
        <div style="text-align:center;padding:20px 0;font-size:24px;font-weight:700;color:#1a1a2e">ShouYinPOS</div>
        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
          <h2 style="font-size:20px;margin:0 0 8px">欢迎加入！</h2>
          <p style="color:#666;line-height:1.6">您好 ${userName || '用户'}，感谢注册 ShouYinPOS 账号！</p>
          <p style="color:#666;line-height:1.6">现在您可以：</p>
          <ul style="color:#666;line-height:1.8;padding-left:20px">
            <li>购买授权套餐，开始使用收银管理功能</li>
            <li>管理门店、员工、商品和订单</li>
            <li>查看销售数据和分析报告</li>
          </ul>
          <div style="text-align:center;margin:24px 0">
            <a href="https://www.lequ.pw/pricing" style="display:inline-block;padding:12px 32px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">查看套餐</a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px">
          ShouYinPOS &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `,
    textContent: `欢迎加入 ShouYinPOS！\n\n您好 ${userName || '用户'}，感谢注册 ShouYinPOS 账号！\n\n现在您可以：\n1. 购买授权套餐，开始使用收银管理功能\n2. 管理门店、员工、商品和订单\n3. 查看销售数据和分析报告\n\n访问 https://www.lequ.pw/pricing 查看套餐`,
  }
}

/**
 * 生成订单确认邮件
 */
export function buildOrderConfirmEmail({ orderNo, planName, amount, paidAt }) {
  const amountYuan = (amount / 100).toFixed(2)
  return {
    subject: `订单确认 - ${orderNo}`,
    htmlContent: `
      <div style="max-width:600px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">
        <div style="text-align:center;padding:20px 0;font-size:24px;font-weight:700;color:#1a1a2e">ShouYinPOS</div>
        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
          <h2 style="font-size:20px;margin:0 0 8px">支付成功</h2>
          <p style="color:#666;line-height:1.6">您的订单已支付成功，以下是订单详情：</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;color:#999">订单号</td><td style="padding:8px;font-weight:600">${orderNo}</td></tr>
            <tr><td style="padding:8px;color:#999">套餐</td><td style="padding:8px;font-weight:600">${planName}</td></tr>
            <tr><td style="padding:8px;color:#999">金额</td><td style="padding:8px;font-weight:600;font-size:18px">¥${amountYuan}</td></tr>
            <tr><td style="padding:8px;color:#999">支付时间</td><td style="padding:8px">${paidAt || new Date().toLocaleString()}</td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="https://www.lequ.pw/dashboard" style="display:inline-block;padding:12px 32px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">查看授权</a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px">
          ShouYinPOS &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `,
    textContent: `支付成功 - ${orderNo}\n\n您的订单已支付成功。\n套餐：${planName}\n金额：¥${amountYuan}\n支付时间：${paidAt || new Date().toLocaleString()}`,
  }
}

/**
 * 生成授权到期提醒邮件
 */
export function buildExpiryReminderEmail({ licenseKey, productEdition, expiredAt, daysLeft }) {
  const editionMap = { basic: '基础版', pro: '专业版', enterprise: '企业版' }
  return {
    subject: `授权即将到期 - ${licenseKey.slice(-8)}`,
    htmlContent: `
      <div style="max-width:600px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">
        <div style="text-align:center;padding:20px 0;font-size:24px;font-weight:700;color:#1a1a2e">ShouYinPOS</div>
        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
          <h2 style="font-size:20px;margin:0 0 8px">授权即将到期</h2>
          <p style="color:#666;line-height:1.6">您的授权即将到期，为不影响正常使用，请及时续费。</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;color:#999">授权码</td><td style="padding:8px;font-weight:600;font-family:monospace">${licenseKey}</td></tr>
            <tr><td style="padding:8px;color:#999">版本</td><td style="padding:8px;font-weight:600">${editionMap[productEdition] || productEdition}</td></tr>
            <tr><td style="padding:8px;color:#999">到期日</td><td style="padding:8px;font-weight:600;color:${daysLeft <= 3 ? '#e53e3e' : '#dd6b20'}">${expiredAt}</td></tr>
            <tr><td style="padding:8px;color:#999">剩余天数</td><td style="padding:8px;font-weight:600;color:${daysLeft <= 3 ? '#e53e3e' : '#dd6b20'}">${daysLeft} 天</td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="https://www.lequ.pw/pricing" style="display:inline-block;padding:12px 32px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">立即续费</a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px">
          ShouYinPOS &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `,
    textContent: `授权即将到期 - ${licenseKey}\n\n授权码：${licenseKey}\n版本：${editionMap[productEdition] || productEdition}\n到期日：${expiredAt}\n剩余天数：${daysLeft} 天\n\n请登录 https://www.lequ.pw/pricing 及时续费。`,
  }
}
