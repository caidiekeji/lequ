# ShouYinPOS 授权管理系统 — 完整系统设计与缺陷诊断（v2）

> 文档定位：基于现有代码库（Cloudflare Workers + Hono + D1 + Vue3 Admin + 官网 SPA）的全面缺陷审计与重构级完整设计。
> 适用对象：架构师 / 全栈工程师 / 产品经理。
> 编写原则：技术决策必带业务理由；剔除一切团队 / 预算 / 排期废话。

---

## 第一部分　现有项目缺陷诊断（代码审计结论）

> 本部分基于对 `src/`、`admin/src/`、`migrations/` 的实际代码审计，按严重程度分级，每条缺陷均给出**证据（文件:行）**、**危害**、**修复方向**。

### 1.1 致命级缺陷（P0 — 资金 / 数据 / 安全直接损失）

#### 缺陷 #1：支付回调无签名验证，存在「伪造支付通知」攻击面
- **证据**：`src/routes/pay-callback.js:13-68`，`wechat` / `alipay` / `unionpay` 三个回调均仅解析 `order_no`，**无任何签名校验**。
- **危害**：任意攻击者构造 `POST /api/orders/callback/wechat` `{"order_no":"ORD..."}` 即可让任意 pending 订单变 paid 并自动生成授权码，**直接造成无限免费授权**。
- **修复方向**：
  - 微信 V3 回调必须用 APIv3 密钥解密 `resource.ciphertext` 并校验 `Wechatpay-Signature` 头（证书序列号 + SHA256withRSA）。
  - 支付宝必须按字典序拼参数 + RSA2 验签。
  - 回调必须**幂等**：基于 `out_trade_no` + 事务状态机，已 paid 直接返回 SUCCESS 不重复发牌。
  - 增加回调来源 IP 白名单（微信/支付宝官方 IP 段）作为纵深防御。

#### 缺陷 #2：金额未在回调侧二次校验
- **证据**：`pay-callback.js:71-79`，仅 `UPDATE status='paid'`，**未比对回调金额与订单 amount**。
- **危害**：用户可发起小额支付（如 0.01 元）后伪造大额订单回调，金额不一致也无任何拦截。
- **修复方向**：回调侧校验 `callback.total === order.amount`（分单位），不一致则记录告警日志并拒绝放行。

#### 缺陷 #3：对外激活 API（`/api/v1/activate`）无任何鉴权
- **证据**：`src/routes/api-v1.js:11` 路由未挂任何中间件，`src/index.js:93` 直接 `app.route('/api', apiV1Routes)`。
- **危害**：激活 / 心跳 / 状态查询接口完全开放，攻击者可：① 爆破 `license_key` 字典；② 通过 `status/:instanceId` 爬取所有实例信息（instanceId 是 UUID 但仍属信息泄露）；③ 大量调用 heartbeat 制造写入压力。
- **修复方向**：
  - 引入「客户 API Key + HMAC 签名」机制（`X-Api-Key` + `X-Signature` + 时间戳防重放）。
  - `license_key` 激活失败次数限流（基于 IP + key 维度，KV/Durable Object 计数，5 次/10 分钟锁）。
  - 心跳接口加入 `instance_id` 维度限流（每实例 1 次/分钟）。

#### 缺陷 #4：CORS 配置回退到 `*`，与凭证传输叠加存在风险
- **证据**：`src/index.js:40-63`，当请求 `Origin` 不在白名单时 `allowOrigin = allowedOrigins[0]`（默认回退到第一个白名单），且**始终允许 Authorization 头**；若 `CORS_ORIGINS` 未配置则 `allowOrigin = '*'`。
- **危害**：配置缺失时全网任意站点可携带 token 跨域调用（虽然 fetch 默认不带 cookie，但 Bearer token 由前端 JS 主动附加，跨站脚本可读取）。
- **修复方向**：白名单未匹配时**直接拒绝**（返回不带 ACAO 头的响应），严禁回退；生产强制要求 `CORS_ORIGINS` 非空。

#### 缺陷 #5：JWT 密钥硬编码在 `wrangler.toml`
- **证据**：`wrangler.toml:34` `JWT_SECRET = "shouquan-dev-jwt-secret-key-2024"`、`ADMIN_PASSWORD = "admin123"`。
- **危害**：仓库一旦泄露（含推送到公开仓库），任何人可伪造任意管理员/用户 token。
- **修复方向**：`JWT_SECRET` 改用 `wrangler secret put`，从 `[vars]` 移除；`.gitignore` 增加 `.dev.vars`；ADMIN_PASSWORD 改为首次启动强制改密。

---

### 1.2 严重级缺陷（P1 — 业务逻辑 / 数据一致性 / 可用性）

#### 缺陷 #6：发牌逻辑两处重复且无事务，存在「订单 paid 但未发牌」/「重复发牌」风险
- **证据**：发牌逻辑同时出现在 `pay-callback.js:84-117` 与 `admin-payment.js:74-106`，**完全复制粘贴**；D1 不支持多表事务（单条 `prepare` 才原子）。
- **危害**：① 任一中间步骤抛错（如 `createLicense` 失败）订单已 paid 但无 license，资金与授权脱钩；② 改动发牌规则需改两处，极易遗漏。
- **修复方向**：抽出 `fulfillOrder(db, order)` 单一职责函数；用 D1 的 `batch()` 把 `UPDATE orders` + `INSERT license` + `UPDATE orders.license_id` 放进同一 batch 保证原子；admin confirm 走同一函数。

#### 缺陷 #7：套餐 code 与产品版本（product_edition）概念混淆
- **证据**：`db.js:41` `EDITIONS[data.product_edition]` 期望 `basic/standard/premium/enterprise`，而 `002_users_orders.sql:79-82` 套餐 code 是 `basic/pro/enterprise`；`pay-callback.js:102` 直接 `product_edition: plan.code`。
- **危害**：购买 `pro` 套餐 → `EDITIONS['pro']` 为 undefined → 落到 `EDITIONS.basic`（`db.js:41` 的 `||` 兜底），**用户花企业价买到基础版限额**。
- **修复方向**：统一概念——`plans.code` 即为 `product_edition`；删除 `EDITIONS` 硬编码字典，限额完全由 `plans` 表驱动；增加 `product_edition` 校验在发牌前。

#### 缺陷 #8：管理后台 RBAC 形同虚设
- **证据**：`admin.js:22` 仅 `router.use('*', authenticate)`，**未校验 `role`**；`admin.js:174-180` 删除管理员仅阻止删 `super_admin`，但任何 `viewer` 角色也能删普通管理员、改支付配置、确认收款。
- **危害**：方案宣称 `super_admin/admin/viewer` 三级角色，实际所有登录管理员权限等价。viewer 可确认收款 / 改配置 / 删管理员。
- **修复方向**：引入 `requireRole('super_admin')` / `requirePermission('order:confirm')` 中间件矩阵（详见第三部分）；前端路由 meta 增加 `roles` 字段做按钮级控制。

#### 缺陷 #9：管理后台审计日志严重缺失
- **证据**：`admin.js` 全文无一处写入 `admin_logs`；`license_audit_logs` 仅由激活/吊销/心跳写入；`admin_logs` 表在方案中声明但**代码从未 INSERT**。
- **危害**：管理员确认收款、改配置、删管理员、改套餐价格等高危操作**无任何审计痕迹**，出问题无法追责，不符合 SaaS 合规要求。
- **修复方向**：统一 `logAdminAction(c, action, targetType, targetId, detail)` 工具函数，在所有写操作后调用；前端操作日志页改读 `admin_logs`。

#### 缺陷 #10：分页参数未做上限保护，存在翻库攻击
- **证据**：`db.js:194` `pageSize = 20` 默认但 `parseInt(pageSize)` 无上限；`admin.js:30` 用户列表 `ps = parseInt(pageSize)` 无校验。
- **危害**：请求 `?pageSize=1000000` 可一次拉全表，造成 D1 单次查询超限（D1 单查询行数有限）+ 内存爆炸。
- **修复方向**：`ps = Math.min(parseInt(pageSize) || 20, 100)`；`p = Math.max(parseInt(page) || 1, 1)`。

#### 缺陷 #11：`site_visits` 表无清理策略，写入同步阻塞主请求
- **证据**：`track-visit.js:8` `await next()` 后**同步 `await` INSERT**；表无 TTL / 分区。
- **危害**：① 每次 PV 都同步写 D1，拖慢所有页面 TTFB；② 表无限增长，30 天后查询变慢，60 天后 D1 存储成本飙升。
- **修复方向**：① 改用 `c.executionCtx.waitUntil()` 异步写；② Cron Trigger 每日聚合到 `visit_daily_stats` 后删除 30 天前明细；③ 或改用 Cloudflare Analytics Engine（更适合时序访问日志）。

#### 缺陷 #12：密码重置 token 直接返回给客户端
- **证据**：`user-auth.js:137-140` `forgot` 接口直接返回 `reset_token`。
- **危害**：任何人输入他人邮箱即可拿到重置 token 重置对方密码，**账号接管**。
- **修复方向**：token 仅通过邮件发送（MailChannels / Resend / SES），接口统一返回「如果邮箱已注册，重置邮件已发送」。

#### 缺陷 #13：用户登录无频率限制 / 无锁定
- **证据**：`user-auth.js:67-110` 与 `auth.js:16-52` 均无限流。
- **危害**：可对管理员与用户账号做无限密码爆破。
- **修复方向**：基于 IP 的登录失败计数（Durable Object 或 KV），5 次失败锁 15 分钟；密码强度策略（不在 top 10000 弱密码字典）。

---

### 1.3 一般级缺陷（P2 — 可维护性 / 性能 / 体验）

| # | 缺陷 | 证据 | 修复方向 |
|---|------|------|---------|
| 14 | 系统配置表字段名不一致 | `003_system_config.sql` 用 `key/value`，但 `admin.js:131` 写 `WHERE key='system'` 而 `admin-payment.js:39` 用 `CONFIG_KEY` 常量；`方案.md` 又写 `config_key/config_value` | 统一为 `config_key/config_value`，迁移数据 |
| 15 | 时区全部用 `datetime('now')`（UTC）但展示按本地 | 全代码库 | 统一存 UTC ISO8601，前端按用户时区渲染；到期判断用 `datetime('now')` 对比 stored UTC |
| 16 | 授权码生成无防碰撞索引外的并发保护 | `db.js:44-50` while 循环查重 | license_key 加唯一约束（已有）+ 捕获 UNIQUE 冲突重试，避免并发双插 |
| 17 | `app.onError` 仅 console.error，无错误上报 | `index.js:115` | 接入 Sentry / Logflare，区分 4xx/5xx |
| 18 | 前端 token 存 localStorage，存在 XSS 窃取风险 | `request.js:8` | 升级为 HttpOnly Cookie + SameSite=Strict + CSRF Token（Worker 可 set-cookie） |
| 19 | `admin_logs` 表在迁移中根本没创建 | `001-004` 无 `admin_logs` 建表 | 新增迁移 `005_admin_logs.sql` |
| 20 | 前端路由 `createWebHashHistory`（带 #） | `router/index.js:43` | 改 `createWebHistory`，配合 Pages SPA fallback，URL 更规范利于 SEO |
| 21 | 套餐 features 是 JSON 字符串，前端无法按功能开关渲染 | `plans.features` 存 `["基础收银"]` 中文数组 | 抽取 `feature_flags` 独立表（code/name/enabled），套餐关联多选 |
| 22 | 心跳超时 / 离线到期机制定义了字段未实现 | `license_instances.offline_expire_at` / `heartbeat_fail_count` 从未写入 | 心跳失败累加计数，达阈值置 offline；offline_expire_at 用于离线宽限期 |
| 23 | 无订单超时关闭机制 | pending 订单永久 pending | Cron 每小时扫 24h 未支付订单置 cancelled |
| 24 | 无退款流程 | `admin-payment.js` 仅 cancel | 新增 `refunds` 表 + 退款工作流 |

---

## 第二部分　系统总体架构（重构后目标态）

### 2.1 架构全景图

```
                              ┌─────────────────────────────────────┐
       终端用户 / 商户          │   Cloudflare CDN / WAF / Bot Fight  │
        (浏览器)      ───────▶│   + Rate Limiting Rules             │
                              └─────────────────┬───────────────────┘
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │                                           │
                  ┌───────▼────────┐                         ┌────────▼────────┐
                  │ Pages: web/    │                         │ Pages: admin/   │
                  │ 官网 + 用户中心 │                         │ 管理后台 SPA    │
                  │ www.lequ.pw    │                         │ api.xiniu.qzz.io│
                  └───────┬────────┘                         └────────┬────────┘
                          │           JSON API (HTTPS)                │
                          └───────────────────┬──────────────────────┘
                                              │
                              ┌───────────────▼────────────────┐
                              │   Worker: shouquan (Hono)      │
                              │  ┌──────────────────────────┐  │
                              │  │ 中间件链：                 │  │
                              │  │ CORS→限流→日志→auth→audit│  │
                              │  └──────────────────────────┘  │
                              │  路由组：                       │
                              │   /website  (SSR HTML)          │
                              │   /api/auth  (管理员认证)        │
                              │   /api/user  (用户认证)          │
                              │   /api/admin (后台业务 RBAC)     │
                              │   /api/my    (用户中心)          │
                              │   /api/v1    (对外 SDK HMAC)     │
                              │   /api/pay   (支付回调验签)      │
                              └─┬──────────┬──────────┬─────────┘
                                │          │          │
                    ┌───────────▼──┐  ┌─────▼────┐  ┌──▼──────────┐
                    │ D1: lequ     │  │ KV       │  │ Durable     │
                    │ (主业务库)    │  │ (限流/   │  │ Object      │
                    │              │  │  缓存)   │  │ (发牌锁/    │
                    └──────────────┘  └──────────┘  │  心跳计数)  │
                                                    └─────────────┘
                              ┌────────────────────────┐
                              │ Cron Triggers           │
                              │  - 订单超时关闭 (hourly) │
                              │  - 授权过期扫描 (daily)  │
                              │  - 访问统计聚合 (daily)  │
                              │  - 实例心跳超时 (hourly) │
                              └────────────────────────┘
                              ┌────────────────────────┐
                              │ 外部服务                │
                              │  - 微信支付 V3           │
                              │  - 支付宝               │
                              │  - MailChannels (邮件)  │
                              │  - Sentry (错误监控)    │
                              └────────────────────────┘
```

### 2.2 技术选型与业务理由

| 层 | 选型 | 业务理由 |
|----|------|---------|
| 边缘运行时 | Cloudflare Workers（Hono） | 授权校验需全球低延迟（收银机激活发生在门店现场），Workers 边缘部署天然就近；无冷启动，适配心跳高频低延迟场景 |
| 主存储 | D1（SQLite） | 业务为强一致的关系型数据（订单 / 授权 / 资金），D1 提供 SQL + 事务（batch）+ 读副本；成本远低于传统 RDS |
| 限流 / 缓存 | KV | 登录失败计数、API 签名防重放、套餐列表缓存（最终一致），KV 全球秒级读取 |
| 分布式锁 | Durable Object | 发牌流程必须串行化（同一订单并发回调只发一次），DO 单实例特性天然适合 |
| 时序日志 | Analytics Engine（可选） | PV/UV 海量写入，Analytics Engine 专为高基数时序设计，避免 D1 写放大 |
| 后台前端 | Vue 3 + Vite + Pinia + Vue Router | 后台大量动态表单（套餐 / 权限矩阵 / 配置），Vue 响应式 + 组合式 API 适合复杂状态；Vite 构建快 |
| UI 组件 | Element Plus（建议） / 现有自研 | 后台表格密度高、表单复杂，成熟组件库降低实现成本；自研组件可保留品牌页 |
| 官网前端 | 原生 HTML（Worker SSR）+ 静态资源 | 官网 SEO 是获客核心，SSR 直出保证首屏与抓取；避免 SPA 的 SEO 短板 |
| 认证 | JWT（HS256）+ HttpOnly Cookie | 无状态适配边缘；高敏感操作叠加二次验证（管理员改密 / 确认大额收款） |
| 支付 | 微信 V3 + 支付宝 RSA2 | 国内 B2B 收银场景主流支付，必须原生签名校验 |
| 邮件 | MailChannels（Workers 免费） | 密码重置、订单通知、到期提醒，Workers 内置支持 |

---

## 第三部分　完整功能矩阵（前台 + 后台双域反推）

> 严格遵循「产品架构师」准则：前台需求反推到极致，并按业务类型（**SaaS 授权 + 电商交易** 双形态）匹配专业后台能力。

### 3.1 业务域划分（8 大领域 + 1 个基础设施域）

```
┌──────────────────────────────────────────────────────────────────┐
│                      ShouYinPOS 授权管理平台                       │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│ ① 账户域     │ ② 商品域     │ ③ 交易域     │ ④ 授权域（核心）    │
│ Account      │ Catalog      │ Commerce     │ Licensing           │
├──────────────┼──────────────┼──────────────┼─────────────────────┤
│ ⑤ 履约域     │ ⑥ 运营域     │ ⑦ 数据域     │ ⑧ 渠道域            │
│ Fulfillment  │ Operation    │ Analytics    │ Channel             │
├──────────────┴──────────────┴──────────────┴─────────────────────┤
│            ⑨ 基础设施域（认证 / 权限 / 配置 / 审计 / 通知）        │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 前台（用户端 www.lequ.pw）功能清单

#### 3.2.1 官网获客域
| 模块 | 功能点 | 业务理由 |
|------|--------|---------|
| 首页 | Hero + 痛点 + 功能矩阵 + 客户证言 + CTA | 收银系统决策周期长，需建立信任 |
| 功能介绍 | 按版本（基础/专业/企业）的功能矩阵对比表 | B2B 用户按规模自筛版本 |
| 定价 | 套餐卡片 + 月/年切换 + 功能 diff + FAQ | 价格透明降低咨询成本 |
| 文档中心 | 接入指南 / API 文档 / 常见问题 | 降低售后支持成本 |
| 落地追踪 | UTM 参数捕获 + 落地页 A/B | 渠道 ROI 归因 |

#### 3.2.2 账户域（用户中心）
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 邮箱/手机注册 | 邮箱验证激活（防垃圾注册） | P0 |
| 登录 | 账号/手机号 + 密码；失败锁定 | P0 |
| 找回密码 | 邮件重置链接（token 不回显） | P0 |
| 个人资料 | 昵称 / 公司 / 联系方式 / 头像 | P1 |
| 修改密码 | 需校验旧密码 | P0 |
| 绑定手机 | 短信验证码二次校验 | P1 |
| 账号注销 | 软删除 + 数据保留期 | P2 |

#### 3.2.3 交易与履约域（用户视角）
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 套餐购买 | 选套餐 → 下单 → 支付（微信/支付宝） | P0 |
| 我的订单 | 列表 + 状态筛选 + 详情 + 发票申请 | P0 |
| 在线支付 | 扫码支付轮询订单状态（轮询/SSE） | P0 |
| 我的授权 | 授权码列表 + 有效期倒计时 | P0 |
| 授权详情 | 限额信息 + 已激活实例 + 剩余可用 | P0 |
| 授权续费 | 选续费时长 → 续费订单 → 支付 | P0 |
| 实例管理 | 查看激活门店 / 解绑离线实例（每月限额次） | P1 |
| 到期提醒 | 邮件 / 站内信（到期前 30/7/1 天） | P1 |
| 发票管理 | 申请开票 + 查看发票 PDF | P2 |

### 3.3 后台（管理端 api.xiniu.qzz.io）功能矩阵

> 按「SaaS + 电商交易」双形态反推，每域给出专业级能力。

#### 3.3.1 仪表盘（Dashboard）
| 指标卡片 | 图表 | 待办 |
|---------|------|------|
| 今日 GMV / 今日新增用户 / 今日新增授权 / 活跃实例 | 30 天 GMV 趋势 / 新增用户趋势 / 授权激活趋势 / 套餐销量占比（饼图） | 待确认收款订单 / 即将到期授权（7 天） / 心跳异常实例 / 库存告警 |

#### 3.3.2 账户管理域（后台对前台用户的管理）
| 功能 | 说明 | 权限点 |
|------|------|--------|
| 用户列表 | 多条件筛选（状态/注册时间/累计消费/版本） | `user:read` |
| 用户详情 | 基本信息 + 授权 + 订单 + 实例 + 操作日志时间线 | `user:read` |
| 编辑用户 | 改资料 / 改备注 / 打标签 | `user:update` |
| 启用/禁用 | 禁用后其授权全部冻结 | `user:block` |
| 重置密码 | 管理员强制重置（记录审计） | `user:reset_pwd` |
| 用户画像 | 累计消费 / LTV / 首单时间 / 续费次数 | `user:read` |
| 用户标签 | 自定义标签体系（VIP/流失风险/试用） | `user:tag` |
| 批量操作 | 批量禁用 / 批量打标签 / 批量导出 | `user:batch` |

#### 3.3.3 商品域（套餐 = SKU 的专业管理）
> 这是「电商交易」形态的核心后台，不能只做 CRUD。

| 功能 | 说明 | 权限点 |
|------|------|--------|
| 套餐列表 | 卡片/表格视图 + 上下架 + 排序 | `plan:read` |
| 套餐编辑 | 名称/价格/原价/时长/限额（门店/终端/商品/会员） | `plan:update` |
| **功能开关库** | 独立维护 feature 字典（code/名称/分组/图标），套餐多选关联 | `plan:feature` |
| **限额矩阵** | 可视化配置各版本限额表（横向版本纵向资源） | `plan:update` |
| 上下架 | 上架才在定价页展示；下架不影响已购用户 | `plan:toggle` |
| 套餐版本 | 同一套餐历史价格版本（涨价保留旧价给存量） | `plan:version` |
| 促销价 | 限时折扣 / 优惠券配置（折扣/满减/有效期） | `promo:manage` |
| 销量统计 | 各套餐销量 / GMV / 转化率 | `plan:read` |

#### 3.3.4 交易域（订单专业履约工作台）
| 功能 | 说明 | 权限点 |
|------|------|--------|
| 订单列表 | 多维筛选（状态/时间/金额/套餐/支付方式） | `order:read` |
| 订单详情 | 完整信息 + 状态流转时间线 + 关联授权 | `order:read` |
| **手动确认收款** | 上传凭证 + 备注 + 触发发牌（审计必记） | `order:confirm` |
| **退款处理** | 全额/部分退款 + 退款原因 + 自动吊销授权 | `order:refund` |
| 取消订单 | pending 取消（释放） | `order:cancel` |
| 改价 | pending 订单管理员改价（记录原价/改价人） | `order:price` |
| 订单导出 | CSV/Excel（按筛选条件） | `order:export` |
| 发票管理 | 开票申请审批 + 抬头审核 + PDF 归档 | `invoice:manage` |
| 对账 | 与微信/支付宝账单按日对账，标记差异单 | `order:reconcile` |

#### 3.3.5 授权域（系统核心，专业授权生命周期管理）
| 功能 | 说明 | 权限点 |
|------|------|--------|
| 授权列表 | 筛选（状态/版本/客户/到期/来源） | `license:read` |
| 手动创建 | 指定版本/限额/有效期/客户（线下签单场景） | `license:create` |
| **批量生成** | 一次生成 N 张（含前缀/有效期） + 导出卡密 | `license:batch` |
| 授权详情 | 限额 + 实例列表 + 审计日志链 + 到期日 | `license:read` |
| 吊销 | 吊销并联动停用所有实例 | `license:revoke` |
| 延长有效期 | 指定天数延长（记录原因） | `license:extend` |
| 升降级 | 已购授权版本升级（补差价订单） | `license:upgrade` |
| 实例管理 | 查看所有激活门店 / 强制下线某实例 | `instance:manage` |
| 心跳监控 | 异常实例列表（N 天无心跳 / 指纹不匹配） | `instance:monitor` |
| 授权策略 | 配置 bind_mode（strict/loose）/ 离线宽限期天数 / 心跳周期 | `license:policy` |
| 授权统计 | 按版本/状态/到期分布 + 激活率 + 续费率 | `license:read` |

#### 3.3.6 运营域（消息 + 公告 + 客服）
| 功能 | 说明 | 权限点 |
|------|------|--------|
| 站内公告 | 发布 / 定向（全部/某版本/某用户） | `notice:manage` |
| 邮件模板 | 到期提醒 / 续费成功 / 注册欢迎模板编辑 | `notify:template` |
| 短信模板 | 验证码 / 通知短信模板 | `notify:template` |
| 到期提醒配置 | 提前几天发 / 发几次 / 渠道 | `notify:config` |
| 客服工单（轻量） | 用户提交工单 + 后台分配 + 状态流转 | `ticket:manage` |

#### 3.3.7 数据分析域（专业 BI 报表）
| 报表 | 维度 | 权限点 |
|------|------|--------|
| 收入报表 | 日/周/月/自定义区间 GMV + 同比环比 | `analytics:read` |
| 用户分析 | 新增/活跃/留存（次留/7留/30留）+ LTV | `analytics:read` |
| 授权分析 | 激活率 / 到期分布 / 续费率 / 流失分析 | `analytics:read` |
| 转化漏斗 | 访问→注册→下单→支付→激活 全链路 | `analytics:read` |
| 渠道分析 | UTM 来源 ROI / 落地页转化 | `analytics:read` |
| 流量分析 | PV/UV/来源/地域/设备（基于 site_visits） | `analytics:read` |
| 导出 | 所有报表支持 CSV 导出 | `analytics:export` |

#### 3.3.8 渠道/分销域（拓展）
| 功能 | 说明 | 权限点 |
|------|------|--------|
| 渠道商管理 | 注册渠道账号 + 分配专属价 | `channel:manage` |
| 推广链接 | 生成带 channel_code 的推广链接 | `channel:link` |
| 分佣规则 | 按订单金额 / 按套餐配置佣金比例 | `channel:commission` |
| 佣金结算 | 月度结算单 + 提现审核 | `channel:settle` |

#### 3.3.9 基础设施域（认证/权限/配置/审计/系统）
| 模块 | 功能 | 权限点 |
|------|------|--------|
| 管理员管理 | 增删改 + 启禁用 + 重置密码 | `admin:manage`（仅 super_admin） |
| **角色权限矩阵** | 定义角色（super_admin/admin/finance/operator/viewer） + 勾选权限点 | `role:manage`（仅 super_admin） |
| 系统配置 | 站点信息 / Logo / ICP / 客服联系方式 | `config:system` |
| 支付配置 | 微信/支付宝商户证书 + 密钥（加密存储） | `config:payment` |
| 邮件配置 | SMTP / MailChannels 配置 + 测试发送 | `config:notify` |
| 短信配置 | 短信服务商 + 签名 + 模板 | `config:notify` |
| **操作审计日志** | 全量管理员操作（含 IP/UA/前后值） + 哈希链防篡改 | `audit:read` |
| 登录日志 | 管理员登录记录 + 异常登录告警 | `audit:read` |
| 系统监控 | Worker 调用量 / D1 查询量 / 错误率（接 Cloudflare API） | `system:monitor` |
| 数据备份 | D1 定期备份到 R2 | `system:backup` |

---

## 第四部分　数据库设计（完整目标 Schema）

### 4.1 表清单总览

| # | 表名 | 域 | 说明 | 现状 |
|---|------|----|------|------|
| 1 | admins | 基础设施 | 管理员 | 已有 |
| 2 | roles | 基础设施 | 角色定义 | **新增** |
| 3 | permissions | 基础设施 | 权限点字典 | **新增** |
| 4 | role_permissions | 基础设施 | 角色-权限关联 | **新增** |
| 5 | admin_logs | 基础设施 | 管理员操作审计 | **新增（补建）** |
| 6 | login_logs | 基础设施 | 登录日志 | **新增** |
| 7 | users | 账户 | 用户 | 已有 |
| 8 | user_tags | 账户 | 用户标签 | **新增** |
| 9 | password_resets | 账户 | 密码重置 | 已有 |
| 10 | email_verifications | 账户 | 邮箱验证 | **新增** |
| 11 | plans | 商品 | 套餐 | 已有（需扩字段） |
| 12 | features | 商品 | 功能字典 | **新增** |
| 13 | plan_features | 商品 | 套餐-功能关联 | **新增** |
| 14 | plan_versions | 商品 | 套餐价格版本 | **新增** |
| 15 | coupons | 商品 | 优惠券 | **新增** |
| 16 | orders | 交易 | 订单 | 已有（需扩字段） |
| 17 | order_items | 交易 | 订单明细（升级/续费） | **新增** |
| 18 | refunds | 交易 | 退款单 | **新增** |
| 19 | invoices | 交易 | 发票 | **新增** |
| 20 | payments | 交易 | 支付流水（独立于订单） | **新增** |
| 21 | licenses | 授权 | 授权码 | 已有（需扩字段） |
| 22 | license_instances | 授权 | 激活实例 | 已有（需补逻辑） |
| 23 | license_audit_logs | 授权 | 审计链 | 已有 |
| 24 | license_policies | 授权 | 授权策略（bind_mode/宽限期） | **新增** |
| 25 | licenses | 授权 | （升级记录） | 见 license_upgrades |
| 26 | license_upgrades | 授权 | 升级记录 | **新增** |
| 27 | notices | 运营 | 公告 | **新增** |
| 28 | notify_templates | 运营 | 邮件/短信模板 | **新增** |
| 29 | notify_logs | 运营 | 通知发送记录 | **新增** |
| 30 | tickets | 运营 | 工单 | **新增** |
| 31 | channels | 渠道 | 渠道商 | **新增** |
| 32 | channel_links | 渠道 | 推广链接 | **新增** |
| 33 | commissions | 渠道 | 佣金结算 | **新增** |
| 34 | system_config | 基础设施 | 系统配置 | 已有（字段名统一） |
| 35 | site_visits | 数据 | 访问明细 | 已有（加 TTL） |
| 36 | visit_daily_stats | 数据 | 访问日聚合 | **新增** |
| 37 | feature_events | 数据 | 业务事件流（漏斗） | **新增** |

### 4.2 关键新增表 DDL

```sql
-- ============ 基础设施域 ============

-- 角色表
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- super_admin/admin/finance/operator/viewer
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_system INTEGER DEFAULT 0,         -- 系统内置不可删
  created_at TEXT DEFAULT (datetime('now'))
);

-- 权限点字典
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- 如 order:confirm
  name TEXT NOT NULL,
  module TEXT NOT NULL,                -- user/order/license/plan...
  description TEXT DEFAULT ''
);

-- 角色-权限关联
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 管理员操作审计（补建，含哈希链）
CREATE TABLE admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  admin_username TEXT,
  action TEXT NOT NULL,                -- 如 order.confirm / license.revoke
  target_type TEXT,                    -- order/license/user/plan...
  target_id INTEGER,
  detail TEXT DEFAULT '{}',            -- 操作前后值 JSON
  prev_hash TEXT,
  row_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

-- 登录日志
CREATE TABLE login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL,          -- admin/user
  account TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,                -- success/failed/locked
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_login_logs_account ON login_logs(account);

-- ============ 商品域 ============

-- 功能字典（替代 plans.features 的中文数组）
CREATE TABLE features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- multi_store / api_access
  name TEXT NOT NULL,
  group_name TEXT,                     -- 基础/会员/供应链/API
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- 套餐-功能关联
CREATE TABLE plan_features (
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, feature_id)
);

-- 套餐价格版本（支持涨价后保留存量旧价）
CREATE TABLE plan_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  price INTEGER NOT NULL,
  original_price INTEGER DEFAULT 0,
  effective_from TEXT NOT NULL,
  effective_until TEXT,                -- NULL 表示长期
  created_at TEXT DEFAULT (datetime('now'))
);

-- 优惠券
CREATE TABLE coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,                  -- discount/amount
  value INTEGER NOT NULL,              -- 折扣比例(%)或减免金额(分)
  min_amount INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  total_quota INTEGER,                 -- NULL 不限
  used_count INTEGER DEFAULT 0,
  plan_ids TEXT,                       -- NULL 全部套餐，JSON 数组
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============ 交易域 ============

-- 订单扩字段（ALTER）
-- ALTER TABLE orders ADD COLUMN coupon_id INTEGER REFERENCES coupons(id);
-- ALTER TABLE orders ADD COLUMN channel_code TEXT;
-- ALTER TABLE orders ADD COLUMN discount_amount INTEGER DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN invoice_id INTEGER;
-- ALTER TABLE orders ADD COLUMN refunded_amount INTEGER DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN confirm_admin_id INTEGER;
-- ALTER TABLE orders ADD COLUMN expires_at TEXT;          -- pending 超时关闭

-- 支付流水（独立于订单，一笔订单可能多次支付尝试）
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  payment_no TEXT NOT NULL UNIQUE,     -- 内部流水号
  channel TEXT NOT NULL,               -- wechat/alipay/manual
  channel_trade_no TEXT,               -- 第三方交易号
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,                -- pending/paid/failed/refunded
  raw_notify TEXT,                     -- 回调原文（验签通过后存档）
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_channel_trade ON payments(channel_trade_no);

-- 退款单
CREATE TABLE refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  refund_no TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',       -- pending/approved/rejected/refunded
  operator_id INTEGER,
  operated_at TEXT,
  channel_refund_no TEXT,              -- 第三方退款单号
  created_at TEXT DEFAULT (datetime('now'))
);

-- 发票
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  title_type TEXT NOT NULL,            -- personal/company
  title TEXT NOT NULL,
  tax_no TEXT,                         -- 税号（企业）
  email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,                  -- 普通/增值税专用
  status TEXT DEFAULT 'pending',       -- pending/issued/rejected
  pdf_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============ 授权域扩展 ============

-- 授权码扩字段
-- ALTER TABLE licenses ADD COLUMN source TEXT DEFAULT 'manual';     -- manual/order/upgrade
-- ALTER TABLE licenses ADD COLUMN order_id INTEGER REFERENCES orders(id);
-- ALTER TABLE licenses ADD COLUMN user_id INTEGER REFERENCES users(id);
-- ALTER TABLE licenses ADD COLUMN channel_code TEXT;
-- ALTER TABLE licenses ADD COLUMN policy_id INTEGER;

-- 授权策略
CREATE TABLE license_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  bind_mode TEXT DEFAULT 'strict',     -- strict/loose
  offline_grace_days INTEGER DEFAULT 7,
  heartbeat_period_minutes INTEGER DEFAULT 30,
  heartbeat_fail_threshold INTEGER DEFAULT 3,
  description TEXT
);

-- 升级记录
CREATE TABLE license_upgrades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id INTEGER NOT NULL REFERENCES licenses(id),
  from_edition TEXT,
  to_edition TEXT,
  order_id INTEGER REFERENCES orders(id),
  price_diff INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============ 运营域 ============

CREATE TABLE notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT DEFAULT 'all',      -- all/edition/user
  target_value TEXT,                   -- 如 edition='pro'
  is_pinned INTEGER DEFAULT 0,
  publish_at TEXT,
  expire_at TEXT,
  status TEXT DEFAULT 'draft',
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE notify_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- license_expiring/order_paid/welcome
  channel TEXT NOT NULL,               -- email/sms
  subject TEXT,
  content TEXT NOT NULL,               -- 含 {{变量}}
  variables TEXT,                      -- JSON 可用变量列表
  status TEXT DEFAULT 'active'
);

CREATE TABLE notify_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_code TEXT,
  channel TEXT,
  target TEXT,                         -- email 或 phone
  user_id INTEGER,
  status TEXT,                         -- success/failed
  error_msg TEXT,
  content_snapshot TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',          -- open/processing/closed
  assignee_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE ticket_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_type TEXT NOT NULL,             -- user/admin
  from_id INTEGER,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============ 渠道域 ============

CREATE TABLE channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  commission_rate INTEGER DEFAULT 0,   -- 百分比
  custom_prices TEXT,                  -- JSON: {plan_code: price}
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE channel_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_code TEXT NOT NULL,
  landing_page TEXT DEFAULT '/',
  utm_source TEXT,
  utm_campaign TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_code TEXT NOT NULL,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',       -- pending/settled/rejected
  settled_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============ 数据域 ============

CREATE TABLE visit_daily_stats (
  date TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  pv INTEGER DEFAULT 0,
  uv INTEGER DEFAULT 0,
  country_breakdown TEXT               -- JSON
);

CREATE TABLE feature_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  anonymous_id TEXT,
  event_name TEXT NOT NULL,            -- visit/register/create_order/pay/activate
  event_properties TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_feature_events_name_time ON feature_events(event_name, created_at);
```

---

## 第五部分　API 接口完整设计

### 5.1 统一响应规范

```jsonc
// 成功
{ "code": 0, "data": { ... }, "message": "ok" }
// 失败
{ "code": 40100, "data": null, "message": "登录已过期" }
```

**业务码段位规划**：
- `0`：成功
- `400xx`：参数 / 业务校验错误
- `401xx`：认证失败
- `403xx`：授权 / 权限 / 状态不允许
- `404xx`：资源不存在
- `409xx`：冲突（重复）
- `429xx`：限流
- `500xx`：服务端错误

### 5.2 路由总览（重构后）

| 模块 | 前缀 | 鉴权 | 说明 |
|------|------|------|------|
| 官网页面 | `/` `/features` `/pricing` `/docs` | 无 | SSR HTML |
| 用户认证 | `/api/user` | 部分 | register/login/forgot/reset |
| 用户中心 | `/api/my` | userAuth | licenses/orders/profile |
| 商品展示 | `/api/plans` `/api/features` | 无 | 公开 |
| 下单交易 | `/api/orders` | userAuth | 创建/查询/支付 |
| 支付回调 | `/api/pay/callback/*` | 签名验签 | 微信/支付宝 |
| 管理员认证 | `/api/auth` | 部分 | login/me/change-pwd |
| 后台业务 | `/api/admin/*` | adminAuth + RBAC | 见 5.3 |
| 对外 SDK | `/api/v1/*` | HMAC + 限流 | activate/heartbeat/status |

### 5.3 后台业务接口矩阵（含权限点）

```
# 仪表盘
GET  /api/admin/dashboard/summary          [dashboard:read]
GET  /api/admin/dashboard/trends           [dashboard:read]
GET  /api/admin/dashboard/todos            [dashboard:read]

# 账户域
GET  /api/admin/users                      [user:read]        (分页/筛选/标签)
GET  /api/admin/users/:id                  [user:read]
PUT  /api/admin/users/:id                  [user:update]
PUT  /api/admin/users/:id/status           [user:block]
POST /api/admin/users/:id/reset-password   [user:reset_pwd]
POST /api/admin/users/:id/tags             [user:tag]
POST /api/admin/users/batch                [user:batch]
GET  /api/admin/users/export               [user:export]

# 商品域
GET  /api/admin/plans                      [plan:read]
POST /api/admin/plans                      [plan:create]
PUT  /api/admin/plans/:id                  [plan:update]
PUT  /api/admin/plans/:id/status           [plan:toggle]
POST /api/admin/plans/:id/versions         [plan:version]
GET  /api/admin/features                   [plan:feature]
POST /api/admin/features                   [plan:feature]
PUT  /api/admin/features/:id               [plan:feature]
GET  /api/admin/coupons                    [promo:manage]
POST /api/admin/coupons                    [promo:manage]

# 交易域
GET  /api/admin/orders                     [order:read]
GET  /api/admin/orders/:id                 [order:read]
POST /api/admin/orders/:id/confirm         [order:confirm]
POST /api/admin/orders/:id/cancel          [order:cancel]
PUT  /api/admin/orders/:id/price           [order:price]
POST /api/admin/orders/:id/refund          [order:refund]
GET  /api/admin/orders/export              [order:export]
GET  /api/admin/orders/reconcile           [order:reconcile]
GET  /api/admin/invoices                   [invoice:manage]
PUT  /api/admin/invoices/:id               [invoice:manage]

# 授权域
GET  /api/admin/licenses                   [license:read]
POST /api/admin/licenses                   [license:create]
POST /api/admin/licenses/batch             [license:batch]
GET  /api/admin/licenses/:id               [license:read]
PUT  /api/admin/licenses/:id/extend        [license:extend]
POST /api/admin/licenses/:id/revoke        [license:revoke]
POST /api/admin/licenses/:id/upgrade       [license:upgrade]
GET  /api/admin/instances                  [instance:monitor]
POST /api/admin/instances/:id/kick         [instance:manage]
GET  /api/admin/license-policies           [license:policy]
PUT  /api/admin/license-policies/:id       [license:policy]

# 运营域
GET  /api/admin/notices                    [notice:manage]
POST /api/admin/notices                    [notice:manage]
PUT  /api/admin/notices/:id                [notice:manage]
GET  /api/admin/notify-templates           [notify:template]
PUT  /api/admin/notify-templates/:id       [notify:template]
GET  /api/admin/tickets                    [ticket:manage]
POST /api/admin/tickets/:id/reply          [ticket:manage]

# 渠道域
GET  /api/admin/channels                   [channel:manage]
POST /api/admin/channels                   [channel:manage]
PUT  /api/admin/channels/:id               [channel:manage]
GET  /api/admin/commissions                [channel:settle]
POST /api/admin/commissions/:id/settle     [channel:settle]

# 数据域
GET  /api/admin/analytics/revenue          [analytics:read]
GET  /api/admin/analytics/users            [analytics:read]
GET  /api/admin/analytics/licenses         [analytics:read]
GET  /api/admin/analytics/funnel           [analytics:read]
GET  /api/admin/analytics/channel          [analytics:read]
GET  /api/admin/analytics/traffic          [analytics:read]

# 基础设施域
GET  /api/admin/admins                     [admin:read]
POST /api/admin/admins                     [admin:manage]
PUT  /api/admin/admins/:id                 [admin:manage]
DELETE /api/admin/admins/:id               [admin:manage]
GET  /api/admin/roles                      [role:read]
POST /api/admin/roles                      [role:manage]
PUT  /api/admin/roles/:id/permissions      [role:manage]
GET  /api/admin/config/system              [config:system]
PUT  /api/admin/config/system              [config:system]
GET  /api/admin/config/payment             [config:payment]
PUT  /api/admin/config/payment             [config:payment]
GET  /api/admin/config/notify              [config:notify]
PUT  /api/admin/config/notify              [config:notify]
GET  /api/admin/logs/admin                 [audit:read]
GET  /api/admin/logs/login                 [audit:read]
GET  /api/admin/system/monitor             [system:monitor]
```

### 5.4 对外 SDK 接口（重构后含 HMAC 签名）

```
POST /api/v1/activate      Headers: X-Api-Key, X-Timestamp, X-Nonce, X-Signature
POST /api/v1/heartbeat
GET  /api/v1/status/:instanceId
POST /api/v1/deactivate    （主动下线，指纹注销）
```

**HMAC 签名算法**：
```
string_to_sign = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + sha256(BODY)
signature = HMAC_SHA256(secret, string_to_sign)  → Base64
```
- 时间戳偏差 ±5 分钟拒绝；nonce 进 KV 防重放（TTL 10 分钟）。

---

## 第六部分　核心业务流程（时序）

### 6.1 在线购买发牌流程（修复后）

```
用户端                Worker                微信/支付宝          D1
  │  POST /api/orders  │                       │               │
  │ ──────────────────▶│ 创建 pending 订单     │               │
  │                    │──────────────────────────────────────▶│
  │  返回 order_no     │                       │               │
  │ ◀──────────────────│                       │               │
  │  POST /:no/pay     │                       │               │
  │ ──────────────────▶│ 调统一下单生成二维码  │               │
  │                    │──────────────────────▶│               │
  │                    │ ◀──────────────────── │ code_url      │
  │  返回二维码        │                       │               │
  │ ◀──────────────────│                       │               │
  │                    │                       │               │
  │  用户扫码支付      │                       │               │
  │                    │ ◀─── 带签名回调 ────── │               │
  │                    │ 1. 验签（V3/RSA2）    │               │
  │                    │ 2. 校验金额=订单金额  │               │
  │                    │ 3. 幂等检查           │               │
  │                    │ 4. DO 串行锁(order_no)│               │
  │                    │ 5. batch:             │               │
  │                    │    UPDATE orders paid │               │
  │                    │    INSERT payments    │               │
  │                    │    fulfillOrder():    │               │
  │                    │      INSERT license   │               │
  │                    │      UPDATE order.license_id          │
  │                    │──────────────────────────────────────▶│
  │                    │ 6. 写 admin_logs/audit│               │
  │                    │ 7. 触发邮件通知       │               │
  │                    │ ──── SUCCESS ────────▶│               │
  │  轮询订单状态变 paid（或 SSE 推送）        │               │
```

### 6.2 授权激活与心跳流程

```
收银机               Worker(DO锁)           D1
  │ POST /activate    │                       │
  │ license_key+指纹  │                       │
  │ +HMAC签名         │                       │
  │ ─────────────────▶│ 1. 验签+限流          │
  │                   │ 2. 查 license         │
  │                   │─────────────────────▶│
  │                   │ 3. 校验状态/有效期/激活数
  │                   │ 4. DO 串行(license_id)│
  │                   │    防并发超额激活      │
  │                   │ 5. INSERT instance    │
  │                   │ 6. INSERT audit_log   │
  │                   │─────────────────────▶│
  │ ◀ 返回 instance_id + 限额 + 离线宽限期   │
  │                    │                       │
  │ 每 N 分钟心跳     │                        │
  │ ─────────────────▶│ 更新 last_heartbeat   │
  │                   │ 校验指纹(strict)      │
  │                   │ 失败则 fail_count++   │
  │                   │ 达阈值→status=offline │
```

### 6.3 退款与吊销联动流程

```
管理员               Worker                 D1
  │ POST refund       │                       │
  │ ─────────────────▶│ 1. 权限校验 order:refund
  │                   │ 2. 创建 refunds pending
  │                   │ 3. 调第三方退款 API   │
  │                   │ 4. 退款成功→          │
  │                   │    orders.refunded_amount++
  │                   │    若全额退款→吊销关联 license
  │                   │    REVOKE 所有 instance
  │                   │ 5. 审计 + 通知用户    │
```

---

## 第七部分　安全设计（完整加固清单）

### 7.1 认证与会话

| 项 | 设计 |
|----|------|
| 密码存储 | PBKDF2-SHA256，10w 轮迭代，每用户独立 salt |
| 密码策略 | ≥8 位 + 大小写+数字+符号 至少三类；拒 top 10k 弱密码字典 |
| 登录限流 | IP 维度 10 次/分钟；账号维度 5 次失败锁 15 分钟（KV 计数） |
| Token 存储 | HttpOnly + Secure + SameSite=Lax Cookie，弃 localStorage |
| Token 有效期 | admin 2h（敏感），user 7d；刷新机制（滑动续期） |
| 二次验证 | 管理员大额收款确认 / 改支付配置 / 删管理员 → 二次密码或 TOTP |
| 找回密码 | token 仅邮件发送，单次有效，1h 过期 |

### 7.2 权限（RBAC + 数据级）

- **功能权限**：基于 `role_permissions` 矩阵，中间件 `requirePermission(code)`。
- **数据权限**：operator 角色仅看自己处理的订单；finance 看全部订单但不能改授权；通过 `data_scope` 字段控制。
- **越权防护**：所有 `/api/my/*` 必须校验资源 `user_id === 当前 userId`（现有代码已部分做到，需全覆盖）。

### 7.3 支付安全

- 回调**强制验签**（详见缺陷 #1）。
- 金额二次校验（缺陷 #2）。
- 回调 IP 白名单。
- 商户私钥用 Cloudflare Secret 存储，不入库不入仓。
- 退款单独权限 + 二次确认。

### 7.4 数据安全

| 项 | 设计 |
|----|------|
| SQL 注入 | 全量参数化（现有已做，需审计 LIKE 拼接处） |
| XSS | 官网 SSRP 输出转义；后台 v-html 禁用；CSP 头限制 |
| CSRF | SameSite Cookie + 敏感操作 X-CSRF-Token |
| 敏感字段加密 | 支付配置私钥用 Worker 端 AES-GCM 加密后入库（密钥走 Secret） |
| 日志脱敏 | 密码/token/手机号中间 4 位脱敏 |
| 审计哈希链 | admin_logs 接入 `prev_hash + row_hash` 防篡改（同 license_audit_logs） |
| 备份 | D1 每日 Export → R2，保留 30 天 |

### 7.5 限流与防刷

| 场景 | 规则 |
|------|------|
| 注册 | IP 5 次/小时；同一邮箱 1 次/10 分钟 |
| 登录 | 账号 5 次/15 分钟；IP 20 次/小时 |
| 激活 | license_key 10 次/小时；IP 30 次/小时 |
| 心跳 | instance 1 次/分钟 |
| 支付回调 | IP 白名单 + 签名 |
| 后台 API | 管理员 600 次/分钟（正常使用远低于） |

实现：基于 Cloudflare **Rate Limiting Rules**（边缘层）+ KV 计数（业务层）双层。

---

## 第八部分　非功能性设计

### 8.1 可观测性

| 维度 | 方案 |
|------|------|
| 日志 | Worker `console.log` → Cloudflare Logpush → Logflare/CL；结构化 JSON |
| 指标 | Analytics Engine 记录业务指标；Cloudflare 自带 Worker metrics |
| 错误 | Sentry（@sentry/cloudflare）捕获 5xx；告警 webhook |
| 链路 | Worker Request ID 透传到日志与 audit_log，可串联一次请求全链路 |
| 业务大盘 | 后台「系统监控」页聚合上述数据 |

### 8.2 性能

| 场景 | 策略 |
|------|------|
| 列表查询 | 所有筛选字段建索引；深分页用 keyset pagination（WHERE id < ?） |
| 仪表盘 | KV 缓存聚合结果 5 分钟（key: dashboard:summary:yyyy-mm-dd） |
| 套餐列表 | KV 缓存（变更时 invalidate） |
| 官网首屏 | SSR + 静态资源 CDN + Cache-Control: s-maxage=300 |
| 心跳 | DO 内内存计数减少 D1 写入，批量落库 |
| site_visits | 改 Analytics Engine 或 waitUntil 异步写 |

### 8.3 可用性

- Cloudflare 自带多地域边缘高可用。
- D1 读副本自动就近读取。
- 支付/发牌核心链路：失败自动重试 + 死信队列（DO 内重试 3 次）。
- 降级：支付回调验签服务异常时拒收（宁可不发牌不可错发）。

---

## 第九部分　前端架构（管理后台重构）

### 9.1 目录结构

```
admin/src/
├── api/
│   ├── request.js            # fetch 封装 + 拦截器
│   ├── auth.js               # 认证
│   ├── user.js / license.js / order.js / plan.js / analytics.js ...
├── router/
│   ├── index.js              # 路由 + 守卫
│   └── permission.js         # 基于权限点的路由过滤
├── stores/
│   ├── user.js               # 当前管理员 + 权限点集合
│   ├── app.js                # 侧边栏折叠 / 主题
├── directives/
│   └── permission.js         # v-permission="'order:confirm'" 按钮级控制
├── components/
│   ├── layout/               # MainLayout / Sidebar / Header
│   ├── table/                # ProTable 通用表格（搜索+分页+操作列）
│   ├── form/                 # ProForm 动态表单
│   └── charts/               # 折线/饼图/漏斗
├── views/
│   ├── login/
│   ├── dashboard/
│   ├── users/   licenses/   orders/   plans/
│   ├── analytics/   operations/   channel/
│   ├── settings/
│   │   ├── admins/   roles/   system-config/   payment/   notify/
│   └── logs/
├── utils/
│   ├── permission.js         # hasPermission()
│   ├── format.js             # 金额/日期格式化
│   └── export.js             # CSV 导出
└── App.vue / main.js
```

### 9.2 关键交互设计

- **路由守卫**：登录后拉取当前 admin 的权限点集合，存 store；路由 meta 声明 `permission`，无权限跳 403。
- **按钮级控制**：`<el-button v-permission="'order:refund'">退款</el-button>`，指令读取 store 判断显隐。
- **ProTable 模式**：声明式 columns + searchConfig，统一处理分页/筛选/排序/loading，减少重复代码。
- **乐观更新**：状态切换（启禁用 / 吊销）先改 UI 再请求，失败回滚 + toast。
- **金额单位**：全局分为单位（整数），展示层统一 `/100` 并格式化 `¥1,299.00`。

---

## 第十部分　迁移与演进路径

### 10.1 数据库迁移序列（新增）

```
migrations/
├── 005_admin_logs.sql           # 补建 admin_logs + login_logs
├── 006_rbac.sql                 # roles + permissions + role_permissions + 种子数据
├── 007_features.sql             # features + plan_features + 迁移旧 features 字段
├── 008_payments_refunds.sql     # payments + refunds + invoices
├── 009_orders_alter.sql         # orders 扩字段（coupon/channel/refunded_amount/expires_at）
├── 010_licenses_alter.sql       # licenses 扩字段（source/order_id/user_id/policy_id）
├── 011_license_policies.sql     # license_policies + license_upgrades
├── 012_operation_tables.sql     # notices + notify_templates + tickets
├── 013_channel_tables.sql       # channels + channel_links + commissions
├── 014_analytics_tables.sql     # visit_daily_stats + feature_events
├── 015_config_rename.sql        # system_config 字段名统一 key→config_key
└── 016_seed_rbac.sql            # 种子权限点 / 默认角色
```

### 10.2 P0 缺陷修复优先级

> 必须先修，否则上线即裸奔。

1. 支付回调验签（缺陷 #1 #2）→ 上线前阻断。
2. 对外 API 鉴权（缺陷 #3）→ 上线前阻断。
3. JWT 密钥移出仓库（缺陷 #5）→ 立即。
4. RBAC 落地（缺陷 #8）→ 上线前阻断。
5. 审计日志补建（缺陷 #9）→ 上线前阻断。

### 10.3 演进路线（纯技术演进，不含排期）

- **阶段 A — 安全加固**：P0 缺陷 + RBAC + 审计 + 限流。
- **阶段 B — 交易专业化**：payments/refunds/invoices + 对账 + 改价。
- **阶段 C — 授权增强**：策略配置 + 升降级 + 实例监控 + 心跳超时。
- **阶段 D — 运营增长**：优惠券 + 公告 + 工单 + 邮件/短信模板 + 到期提醒。
- **阶段 E — 数据驱动**：漏斗 + 渠道分析 + 分销。
- **阶段 F — 体验优化**：SSE 推送、深分页优化、监控大盘。

---

## 附录 A　关键技术决策摘要

| 决策 | 选择 | 拒绝的替代 | 理由 |
|------|------|-----------|------|
| 发牌原子性 | D1 batch + DO 锁 | 单条 update | 跨表一致性 |
| 访问日志 | Analytics Engine | D1 同步写 | 海量写入性能 |
| 限流 | KV + 边缘 RL | 仅应用层 | 双层纵深 |
| Token | HttpOnly Cookie | localStorage | 防 XSS |
| 授权码生成 | crypto.randomUUID + 唯一约束 | 自增 | 不可枚举 |
| 多版本定价 | plan_versions 表 | 直接改 plans.price | 存量用户旧价保留 |

## 附录 B　对现有代码的最小修复 Patch 清单（落地参考）

> 以下为针对 P0/P1 缺陷的最小化修复点，供工程师直接定位。

1. `src/routes/pay-callback.js` — 引入 `verifyWechatSign()` / `verifyAlipaySign()`，金额校验，幂等检查。
2. `src/routes/api-v1.js` — 新增 `hmacAuth` 中间件 + 限流。
3. `wrangler.toml` — 删除 `[vars]` 中的 `JWT_SECRET`/`ADMIN_PASSWORD`，改 `wrangler secret put`。
4. `src/index.js:40-63` — CORS 不匹配白名单时不返回 ACAO。
5. `src/middleware/auth.js` — 新增 `requirePermission(code)` 导出。
6. `src/routes/admin.js` 全部写接口 — 加 `requirePermission` + 调用 `logAdminAction()`。
7. 新增 `src/utils/audit.js` — `logAdminAction` + 哈希链。
8. `src/db.js:41` — 删除 `EDITIONS` 字典，限额完全由 plans 驱动；发牌前校验。
9. `src/routes/user-auth.js:137` — 删除 `reset_token` 返回，改邮件发送。
10. `src/middleware/track-visit.js:8` — 改 `c.executionCtx.waitUntil()` 异步写。
11. 全部列表接口 — `pageSize` 上限 100。

---

*文档结束。本设计基于代码审计产出，所有技术选型与表结构均针对 ShouYinPOS「SaaS 授权 + 在线交易」双业务形态，可直接作为重构与扩展的工程蓝本。*
