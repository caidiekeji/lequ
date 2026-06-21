---
name: qianduan
version: 7.2.0
display_name: 全栈设计开发引擎
category: web-design
triggers:
  - 网站布局
  - 页面结构
  - 配色方案
  - 网站色板
  - 落地页设计
  - 动效
  - 数字滚动
  - css动画
  - 图表加载动画
  - 仪表板设计
  - 设计审查
  - 无障碍审计
  - 设计令牌导出
  - UX 文案
  - 空状态
  - 动效性能
  - 组件状态
  - RTL 布局
  - 后台管理
  - 模板引擎
  - EJS
  - Pug
  - JSX
  - Vue SFC
  - 接口规范
  - API 契约
  - 字段命名
description: >
  一站式全流程 Web 设计开发助手，覆盖：
  布局与配色生成、60-30-10 主题、17 种布局模板、22 套配色、
  动画微交互（数字滚动/图表加载）、设计令牌主题、
  响应式断点审查、可访问性审计、设计令牌多格式导出、
  页面微文案生成、动效性能分析、组件状态变体补全、国际化 RTL 适配、
  API 接口规范检查与命名对齐、
  含后台管理专用布局与配色预设。
  支持输出 HTML/CSS、设计规范，以及 EJS、Pug、JSX、Vue SFC 等模板/组件格式，
  可直接配合 Node.js 全栈项目使用。
  【重要】优先编写可复用的组件、工具函数和通用样式，避免重复代码。
input_schema:
  type: object
  required: [site_type]
  properties:
    site_type:
      type: string
      enum: [landing_page, ecommerce, corporate, portfolio, blog, dashboard, admin_panel, saas, social_network, restaurant, event]
    industry: { type: string }
    style: { type: string }
    target_audience: { type: string }
    primary_color_hex: { type: string, pattern: '^#[0-9a-fA-F]{6}$' }
    layout_template:
      type: string
      enum: [hero_single_scroll, product_grid_sidebar, classic_three_column, magazine_sidebar, magazine_alternating, dashboard_tiles, admin_sidebar_nav, masonry_gallery, split_screen, bento_grid, fullscreen_video, f_layout, z_layout, asymmetric_grid, horizontal_scroll, card_feed, immersive_overlay]
    color_theme:
      type: string
      enum: [ocean_tech, organic_nature, luxury_gold, startup_vibrant, dark_mode, health_wellness, cyberpunk_neon, soft_pastel, retro_vintage, industrial_concrete, polar_ice, bohemian_spice, midnight_blue, sunset_coral, forest_mist, tech_gradient, pop_art, zen_garden, candy_shop, monochrome_slate, admin_professional, admin_dark]
    design_theme:
      type: string
      enum: [light_default, dark_glass, high_contrast, soft_rounded, sharp_minimal]
    animation_level:
      type: string
      enum: [none, minimal, rich]
    include_charts: { type: boolean }
    chart_library:
      type: string
      enum: [chartjs, echarts, recharts]
    scheme_count: { type: number, minimum: 1, maximum: 3 }
    output_format:
      type: string
      enum: [html_css, design_spec, code_and_spec, ejs_template, pug_template, jsx_component, vue_sfc]
      description: >
        html_css - 完整 HTML 文件（含内联 CSS/JS）
        design_spec - Markdown 设计规范
        code_and_spec - 同时提供代码和规范
        ejs_template - EJS 模板（含 <%= %> 占位符）
        pug_template - Pug 模板（含变量插值）
        jsx_component - React JSX 组件（函数组件）
        vue_sfc - Vue 单文件组件（<template> + <script> + <style>）
    enable_responsive_review: { type: boolean, default: false }
    enable_a11y_audit: { type: boolean, default: false }
    enable_token_export: { type: boolean, default: false }
    token_export_format:
      type: string
      enum: [tailwind_config, css_vars, style_dictionary, figma_tokens]
    enable_ux_writing: { type: boolean, default: false }
    brand_voice:
      type: string
      enum: [professional, friendly, playful, luxurious, technical, minimal]
    enable_performance_audit: { type: boolean, default: false }
    enable_component_states: { type: boolean, default: false }
    enable_rtl_support: { type: boolean, default: false }
    enable_api_contract_check: { type: boolean, default: false }
    api_naming_style:
      type: string
      enum: [camelCase, snake_case]
      description: 项目约定的接口命名风格，默认 camelCase
    project_name:
      type: string
      description: 项目名称，用于定位后端接口文档路径 doc/prd/{project_name}项目后端接口.md
    backend_api_doc_path:
      type: string
      description: 后端接口文档路径，默认 doc/prd/{project_name}项目后端接口.md
    enable_page_integrity_check: 
      type: boolean
      default: false
      description: 启用页面完整性检查，扫描生成的代码，检查是否有缺失的页面或链接
output:
  oneOf:
    - description: 所选输出格式的代码或设计规范
    - description: 若启用扩展模块，将追加审查报告/令牌文件/文案对照表/接口规范检查报告等
---

# 全栈设计开发引擎

## 🎯 核心原则（必读）
1. **组件优先**：优先封装可复用的 UI 组件（按钮、卡片、表单、导航等）
2. **工具函数库**：封装通用的工具函数（日期格式化、数据验证、API 调用封装等）
3. **样式复用**：使用 CSS 变量、Tailwind 类、BEM 等方式实现样式复用
4. **DRY 原则**：避免重复代码，相似功能抽取为通用逻辑
5. **单一职责**：每个组件/函数只做一件事，保持简单可测试

---

## 核心能力一：布局与配色生成

### 网站类型与默认布局

| 类型           | 默认布局模板                   | 说明                 |
| -------------- | ------------------------------ | -------------------- |
| landing_page   | hero_single_scroll             | 产品落地页、活动推广 |
| ecommerce      | product_grid_sidebar           | 商品筛选与网格       |
| corporate      | classic_three_column           | 企业官网             |
| portfolio      | masonry_gallery / split_screen | 创意作品集           |
| blog           | magazine_sidebar               | 内容博客             |
| dashboard      | dashboard_tiles                | 数据分析面板         |
| admin_panel    | admin_sidebar_nav              | 后台管理系统         |
| saas           | feature_split_scroll           | SaaS 产品页          |
| social_network | social_feed_sidebar            | 社交动态信息流       |
| restaurant     | ambient_split_screen           | 氛围餐饮             |
| event          | countdown_hero                 | 活动倒计时           |

### 布局模板库 (17种)

| 模板ID               | 名称         | 特点                                        | 适用场景           |
| -------------------- | ------------ | ------------------------------------------- | ------------------ |
| hero_single_scroll   | 英雄单页滚动 | 全屏英雄+分段内容+页脚CTA                   | 落地页、SaaS       |
| product_grid_sidebar | 网格+侧边栏  | 筛选侧边栏+卡片网格                         | 电商、分类         |
| classic_three_column | 经典三栏     | 页头/英雄/三栏亮点/新闻/联系                | 企业官网           |
| magazine_sidebar     | 杂志侧边栏   | 主内容+右侧边栏                             | 博客、资讯         |
| magazine_alternating | 交替杂志     | 图文左右交替，大量留白                      | 深度内容           |
| dashboard_tiles      | 仪表板磁贴   | 磁贴卡片+图表槽+数据表格                    | 数据分析           |
| admin_sidebar_nav    | 后台侧边导航 | 固定侧边栏 + 顶栏 + 内容区 (表格/表单/卡片) | 后台管理、CRUD     |
| masonry_gallery      | 瀑布流画廊   | 多列不等高网格，悬停信息层                  | 摄影、作品集       |
| split_screen         | 左右分屏     | 固定图像侧+滚动内容                         | 高端餐饮、品牌故事 |
| bento_grid           | Bento 网格   | 大小不一功能卡片                            | 产品亮点、特性     |
| fullscreen_video     | 全屏视频背景 | 自动播放视频+浮动内容                       | 影视、游戏         |
| f_layout             | F型阅读布局  | 顶部导航+宽主内容区                         | 文档、教程         |
| z_layout             | Z型引导布局  | 视觉从左到右斜下扫描，强调转化              | 极简落地页         |
| asymmetric_grid      | 不对称网格   | 错位多列图文                                | 创意机构           |
| horizontal_scroll    | 横向滑动     | 水平滚动展示卡片                            | 画廊、产品展示     |
| card_feed            | 信息流卡片   | 单/双列无限卡片                             | 社交动态、通知     |
| immersive_overlay    | 沉浸式叠加   | 背景固定，内容半透明浮层滚动                | 时尚、奢华         |

### 配色规则 (60-30-10)

- **60% 主导色**：背景、大面积区域
- **30% 次要色**：导航、卡片、次要区块
- **10% 强调色**：按钮、链接、关键图标

衍生逻辑基于 HSL 空间；自动校验 WCAG AA 对比度。

### 配色主题库 (22套)

| 主题ID              | 名称         | 60% 主色 | 30% 次要色 | 10% 强调色 | 氛围描述              |
| ------------------- | ------------ | -------- | ---------- | ---------- | --------------------- |
| ocean_tech          | 海洋科技     | #1E3A5F  | #4B7B9E    | #FF6B4A    | 专业、创新、可信      |
| organic_nature      | 有机自然     | #F0F7F0  | #7CAA6D    | #D4A373    | 健康、可持续、亲切    |
| luxury_gold         | 奢华暗金     | #1A1818  | #2C2C2C    | #C9A96E    | 高端、专属、精致      |
| startup_vibrant     | 创业活力     | #FFFFFF  | #F4F6F9    | #6C5CE7    | 现代、大胆、创意      |
| dark_mode           | 暗黑模式     | #0F172A  | #1E293B    | #38BDF8    | 科技、沉浸、护眼      |
| health_wellness     | 健康舒适     | #FAFBF7  | #B5D5C0    | #E07A5F    | 关怀、清新、温暖      |
| cyberpunk_neon      | 赛博朋克霓虹 | #0D0221  | #150734    | #FF2A6D    | 反乌托邦、数字未来    |
| soft_pastel         | 柔和粉彩     | #FFF0F5  | #E6E6FA    | #B8A9C9    | 梦幻、温柔            |
| retro_vintage       | 复古胶片     | #F4EADB  | #D4B895    | #C85A3E    | 怀旧、手作、温暖      |
| industrial_concrete | 工业水泥     | #C0C0C0  | #8B8B83    | #F96D00    | 粗犷、硬朗、机能      |
| polar_ice           | 极地冰雪     | #F0F8FF  | #B0E0E6    | #5F9EA0    | 清冷、纯粹、极简      |
| bohemian_spice      | 波西米亚香料 | #FAE5D3  | #D7B49E    | #8B4513    | 异域、手工、艺术      |
| midnight_blue       | 午夜蓝调     | #191970  | #4169E1    | #FFD700    | 深沉、稳重、金融      |
| sunset_coral        | 日落珊瑚     | #FFE4E1  | #F4A460    | #FF4500    | 活力、热情、美食      |
| forest_mist         | 森林薄雾     | #2F4F2F  | #8FBC8F    | #DAA520    | 环保、户外、安详      |
| tech_gradient       | 科技渐变     | #0B0F19  | #1F2937    | #3B82F6    | 深色背景+蓝色发光渐变 |
| pop_art             | 波普艺术     | #FFFF00  | #FF1493    | #00BFFF    | 大胆撞色、活泼、潮流  |
| zen_garden          | 禅意花园     | #F5F5DC  | #D2B48C    | #556B2F    | 和风、冥想、简约      |
| candy_shop          | 糖果商店     | #FFFACD  | #FFB6C1    | #9370DB    | 甜趣、童真、可玩      |
| monochrome_slate    | 单色石板     | #F8FAFC  | #CBD5E1    | #475569    | 专业、中性、B端       |
| admin_professional  | 专业后台     | #F4F7FC  | #E1E8F0    | #1E40AF    | 高效、清晰、企业后台  |
| admin_dark          | 暗夜后台     | #111827  | #1F2937    | #60A5FA    | 沉浸、科技、数据密集  |

### 设计令牌主题

| 主题ID        | 圆角 | 阴影         | 字体             | 间距基元 | 风格         |
| ------------- | ---- | ------------ | ---------------- | -------- | ------------ |
| light_default | 8px  | 轻柔投影     | Inter / SF Pro   | 8px      | 现代简约     |
| dark_glass    | 12px | 弥散玻璃阴影 | Inter / SF Pro   | 10px     | 科技感暗黑   |
| high_contrast | 4px  | 硬阴影       | 系统黑体         | 8px      | 无障碍强对比 |
| soft_rounded  | 20px | 柔软弥散     | 圆体 / Quicksand | 12px     | 可爱温暖     |
| sharp_minimal | 2px  | 无阴影       | 无衬线标准       | 6px      | 瑞士极简     |

### 动画与微交互

#### 通用动画类
- `.fade-up`：进入视口时从下方淡入上移。
- `.card-hover`：悬停卡片轻微上浮并增加阴影。
- `.btn-pulse`：按钮点击时缩放反馈。
- `.skeleton`：文本/卡片骨架屏闪烁加载效果。

#### 数字滚动动画 (animation_level = rich)
- **计数上升**：`<span class="count-up" data-count="目标值" data-duration="2000">0</span>`  
- **数字翻牌**：`<div class="flip-number" data-value="8472"></div>`  
- **百分比环**：`<div class="progress-ring" data-percent="78"></div>`  

#### 图表加载动画 (include_charts = true 或 dashboard/admin_panel 时注入)
- 柱状图：`easeOutQuad` 底部伸展
- 折线图：路径绘制动画
- 环形图/饼图：描边展开 + 中心计数
- 骨架屏：脉冲占位 → 淡出

#### 图表配色
自动衍生 10 色无障碍调色板，示例 (Chart.js)：
​```json
["#2A5C82", "#5B8BA0", "#FF6B4A", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1"]
```



------

## 核心能力二：扩展设计审查与工程化模块

以下模块通过专用参数按需启用，可与核心布局/配色方案并行输出，或单独对已有代码进行分析。

### 1. 响应式实时预览与断点审查 (`enable_responsive_review`)

- **功能**：基于生成或提供的 HTML/CSS，自动生成移动端 (320px)、平板 (768px)、桌面 (1024px)、大屏 (1440px) 的布局快照描述，检测并列出：
  - 栅格断裂、内容溢出
  - 触控目标过小 (< 44px)
  - 字体大小可读性
  - 横向滚动条出现
- **输出**：一份断点审查报告（Markdown），附带修复建议。

### 2. 可访问性审计 (`enable_a11y_audit`)

- **功能**：自动扫描生成的配色与结构，输出：
  - 所有颜色组合对比度数值，标注是否通过 WCAG AA/AAA
  - 语义化 HTML 检查（landmark、heading 层级）
  - 键盘导航流检查（`tabindex`、`focus` 样式）
  - `alt` 文本、ARIA 属性缺失提醒
- **输出**：a11y 审计报告，包含问题列表、严重级别、修复代码片段。

### 3. 设计令牌导出 (`enable_token_export`)

- **功能**：将当前生效的设计令牌主题导出为多种工程格式：
  - `tailwind_config`：完整 `tailwind.config.js` 扩展
  - `css_vars`：`:root` CSS 变量块
  - `style_dictionary`：Style Dictionary JSON 配置
  - `figma_tokens`：Figma Tokens 插件兼容 JSON
- **参数**：`token_export_format` 指定格式，可多选，输出对应文件内容。

### 4. 页面微文案与空状态生成 (`enable_ux_writing`)

- **功能**：根据 `site_type` 和 `brand_voice`，自动生成或替换页面关键 UX 文案：
  - 按钮标签（如"立即体验" vs "Request Demo"）
  - 空状态提示（"还没有订单，去逛逛吧"）
  - 错误提示、加载文案、成功反馈
  - 占位文字（输入框、搜索框）
- **参数**：`brand_voice` 控制语气（professional/friendly/playful/luxurious/technical/minimal）。
- **输出**：文案对照表，可直接嵌入 HTML 相应位置。

### 5. 动效性能剖析 (`enable_performance_audit`)

- **功能**：分析生成的动画代码（数字滚动、图表入场等），输出：
  - 是否使用 `transform`/`opacity`（合成器友好）
  - 是否触发 Layout Thrashing
  - 缺少 `will-change` 或使用不当的警告
  - 预估累积布局偏移（CLS）风险
  - 推荐 `requestAnimationFrame` 或 CSS 动画优化写法
- **输出**：性能诊断报告，含具体优化代码。

### 6. 组件状态与变体补全 (`enable_component_states`)

- **功能**：为生成的核心组件（按钮、输入框、卡片、导航、标签等）自动补全所有交互状态的样式：
  - `:hover`, `:active`, `:focus-visible`, `:disabled`, `[aria-busy="true"]`（加载中）
  - 输出完整的 CSS 类块或 Tailwind 变体组合
- **输出**：组件状态样式表，可直接追加到现有样式。

### 7. 国际化布局适配 RTL (`enable_rtl_support`)

- **功能**：将当前生成的布局一键转换为从右到左（RTL）阅读方向，自动处理：
  - 将 CSS `left/right` 映射为 `inset-inline-start/end`
  - 导航顺序、图表方向、图标翻转
  - 文本对齐（`text-align` → `start`/`end`）
  - 生成 `[dir="rtl"]` 样式块，不破坏原有 LTR
- **输出**：附加的 RTL 样式片段与注意事项。

### 8. API 接口规范检查 (`enable_api_contract_check`)

- **功能**：在生成的前端代码中，自动检查所有 API 调用是否与后端契约一致，包括：
  - **URL 路径规范**：资源名是否使用复数名词、短横线分隔（如 `/api/v1/user-orders`），是否存在硬编码的魔法字符串。
  - **请求参数命名**：分页参数是否统一为 `page` + `pageSize`，查询参数是否全部使用 `api_naming_style` 指定的命名风格（`camelCase` 或 `snake_case`）。
  - **请求体字段命名**：POST/PUT 请求体的字段名是否与约定命名风格一致，是否存在数据库下划线字段直接暴露给前端的情况。
  - **响应结构标准化**：成功响应是否统一包含 `code`、`data`、`message` 字段；错误响应是否包含 `error.code`、`error.message` 结构。
  - **错误码引用**：前端代码中捕获的错误码（如 `ERR_USER_NOT_FOUND`）是否与后端 OpenAPI 文档中定义的枚举值一致。
  - **HTTP 方法语义**：GET 只读、POST 创建、PUT 全量更新、PATCH 部分更新、DELETE 删除，是否使用正确。
  - **后端接口文档匹配**：从 `doc/prd/{project_name}项目后端接口.md` 或自定义路径读取后端接口文档，匹配前端接口命名与后端文档的一致性。
- **参数**：
  - `api_naming_style`：指定项目约定的命名风格，默认 `camelCase`
  - `project_name`：项目名称，用于定位后端接口文档路径
  - `backend_api_doc_path`：后端接口文档路径，默认 `doc/prd/{project_name}项目后端接口.md`
- **输出**：一份 API 接口规范检查报告（Markdown），包含：
  - 通过项（符合规范的接口调用）
  - 违规项（标注文件路径、行号、违规原因、修复建议）
  - 与后端接口文档的字段级对比结果
  - 前端接口命名与后端文档的匹配情况
  - 修复后的代码片段

### 9. 页面完整性检查 (`enable_page_integrity_check`)

- **功能**：扫描生成的前端代码，检查页面完整性，包括：
  - **导航链接检查**：检查所有导航菜单、按钮、链接是否有对应的目标页面
  - **CRUD页面检查**：检查是否存在增删改查功能但缺少对应页面的情况
  - **按钮功能检查**：检查按钮点击事件是否有对应的处理逻辑和目标页面
  - **路由配置检查**：检查路由配置是否完整，是否有未定义的路由
  - **权限控制检查**：检查页面访问权限配置是否完整
- **输出**：一份页面完整性检查报告（Markdown），包含：
  - 缺失页面列表（导航到但未生成的页面）
  - 功能不完整项（有按钮但无对应页面或逻辑）
  - 路由配置问题
  - 修复建议和完整的页面生成方案

------

## 输出格式（支持多种模板引擎/组件格式）

基础输出格式由 `output_format` 参数决定：

| 格式值          | 输出内容                                                     |
| :-------------- | :----------------------------------------------------------- |
| `html_css`      | 完整 HTML 文件，含内联 CSS/JS，绑定动画与图表。适用于任何静态部署或直接嵌入后端模板。 |
| `design_spec`   | Markdown 设计规范（配色表、线框图 ASCII、令牌表）。          |
| `code_and_spec` | 同时提供 `html_css` 和 `design_spec`。                       |
| `ejs_template`  | EJS 模板文件（`.ejs`），使用 `<%= %>` 占位符代表动态数据，如 `<%= pageTitle %>`、`<%= chartData %>`，可直接放入 Express 项目。 |
| `pug_template`  | Pug 模板文件（`.pug`），使用 `#{variable}` 语法插值，结构缩进式。适用于 Express + Pug 引擎。 |
| `jsx_component` | React 函数组件（`.jsx`），使用 `props` 传递数据，包含 JSX 结构和样式对象或 CSS Module 导入。 |
| `vue_sfc`       | Vue 单文件组件（`.vue`），包含 `<template>`、`<script setup>` 和 `<style scoped>`，数据通过 `props` 或 `ref` 驱动。 |

所有格式均保留设计令牌变量（如 `--primary`、`--radius`），动画类名与图表初始化脚本，确保生成产物在 Node.js 全栈项目中开箱即用。

若启用扩展模块，则根据启用的模块在基础输出上追加对应产物（报告文档、令牌文件、文案对照表、状态样式补丁、RTL 适配样式、API 接口规范检查报告等），并在响应中清晰分节。

当启用 `enable_api_contract_check` 并提供 `project_name` 或 `backend_api_doc_path` 时，API 接口规范检查报告将包含后端接口文档的匹配结果，包括：
- 前端接口与后端文档的对应关系
- 字段命名一致性检查
- 接口路径匹配情况
- 方法语义一致性验证

当启用 `enable_page_integrity_check` 时，将生成页面完整性检查报告，包括：
- 缺失页面列表（导航到但未生成的页面）
- 功能不完整项（有按钮但无对应页面或逻辑）
- 路由配置问题
- 修复建议和完整的页面生成方案

------

## 使用示例

**请求 1：生成 Express 后台管理 EJS 模板 + API 规范检查**

text

```
site_type: admin_panel
color_theme: admin_dark
animation_level: rich
include_charts: true
chart_library: chartjs
output_format: ejs_template
enable_a11y_audit: true
enable_api_contract_check: true
api_naming_style: camelCase
```



**预期响应**

1. 暗夜后台 EJS 模板文件（侧边导航 + 数据表格 + 统计卡片 + Chart.js 动画图表）
2. a11y 审计报告（对比度、焦点顺序等）
3. API 接口规范检查报告（列出所有 `fetch`/`axios` 调用是否符合契约，不合规处提供修复代码）

**请求 2：生成 React 仪表板组件**

text

```
site_type: dashboard
color_theme: tech_gradient
layout_template: dashboard_tiles
include_charts: true
chart_library: recharts
output_format: jsx_component
```



**预期响应**
一个 React 函数组件（`Dashboard.jsx`），使用 `recharts` 库，接收 `data` props，直接集成到 Next.js 或 Create React App 项目中。

**请求 3：生成前端代码并匹配后端接口文档**

text

```
site_type: saas
color_theme: ocean_tech
output_format: jsx_component
enable_api_contract_check: true
api_naming_style: camelCase
project_name: my-saas-project
# 可选：自定义后端接口文档路径
# backend_api_doc_path: doc/api/backend-spec.md
```



**预期响应**
1. 海洋科技风格的 SaaS 产品 React 组件
2. API 接口规范检查报告，包含：
   - 前端接口与后端文档（doc/prd/my-saas-project项目后端接口.md）的匹配结果
   - 字段命名一致性检查
   - 接口路径匹配情况
   - 方法语义一致性验证
   - 违规项及修复建议

**请求 4：生成后台管理系统并检查页面完整性**

text

```
site_type: admin_panel
color_theme: admin_dark
layout_template: admin_sidebar_nav
output_format: vue_sfc
enable_page_integrity_check: true
enable_api_contract_check: true
project_name: admin-system
```



**预期响应**
1. 暗夜后台管理系统 Vue 组件（包含侧边导航、数据表格、表单等）
2. 页面完整性检查报告，包含：
   - 导航菜单对应的页面检查结果
   - CRUD功能页面完整性检查
   - 路由配置验证
   - 缺失页面和功能的修复建议
3. API 接口规范检查报告，包含后端接口文档匹配结果

------

*本文件严格遵循 Markdown 技能定义规范。*

```