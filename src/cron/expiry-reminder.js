/**
 * Cron Trigger: 每天扫描即将到期的活跃授权，发送到期提醒邮件
 * 提醒策略：到期前 7 天、3 天、1 天各提醒一次
 * wrangler.toml 需要配置:
 * [triggers]
 * crons = ["0 8 * * *"]
 *
 * MailChannels 要求 Workers 绑定发信域名，否则静默失败。
 */

import { sendMail, buildExpiryReminderEmail } from '../services/email.js'

export async function handleExpiryReminders(env) {
  const db = env.DB

  // 查找未来 1 天、3 天、7 天内到期的活跃授权
  const thresholds = [1, 3, 7]
  let totalSent = 0

  for (const days of thresholds) {
    const targetDate = new Date(Date.now() + days * 86400 * 1000).toISOString().split('T')[0]

    const expiring = await db.prepare(
      `SELECT l.id, l.license_key, l.product_edition, l.valid_until, l.user_id,
              u.email, u.nickname
       FROM licenses l
       JOIN users u ON l.user_id = u.id
       WHERE l.status = 'active'
         AND date(l.valid_until) = date(?)
         AND u.email IS NOT NULL`
    ).bind(targetDate).all()

    for (const lic of (expiring.results || [])) {
      const expiredDate = lic.valid_until
      const daysLeft = Math.max(0, Math.ceil((new Date(expiredDate) - new Date()) / 86400000))

      const result = await sendMail(env, {
        to: lic.email,
        ...buildExpiryReminderEmail({
          licenseKey: lic.license_key,
          productEdition: lic.product_edition,
          expiredAt: expiredDate,
          daysLeft,
        }),
      })

      if (result.success) {
        totalSent++
        console.log(`[cron] expiry-reminder sent to ${lic.email} for ${lic.license_key} (${days} days threshold)`)
      }
    }
  }

  console.log(`[cron] expiry-reminder: ${totalSent} reminders sent`)
}
