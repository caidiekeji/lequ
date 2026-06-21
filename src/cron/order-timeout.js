/**
 * Cron Trigger: 每小时扫描超过24小时未支付的pending订单，自动关闭
 * wrangler.toml 需要配置:
 * [triggers]
 * crons = ["0 * * * *"]
 */
export async function handleOrderTimeout(env) {
  const db = env.DB
  const result = await db.prepare(
    `UPDATE orders SET status = 'cancelled', updated_at = datetime('now')
     WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < datetime('now')`
  ).run()
  console.log(`[cron] order-timeout: ${result.meta?.changes || 0} orders cancelled`)
}
