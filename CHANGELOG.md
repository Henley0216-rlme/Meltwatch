# ReviewPulse 改动日志

本文件记录我方对队友项目 ReviewPulse 的所有修改。

---

## 模块一：Docker 部署修复

**修改文件:** `docker/docker-compose.yml`, `backend/requirements.txt`

- 构建上下文从项目根目录改为 `../backend`，修正 `COPY requirements.txt` 路径
- 移除不存在于 PyPI 的 `aliyun-python-sdk-nlp-automl==1.0.4` 和未使用的 `aliyun-python-sdk-core`
- 端口映射从 `5000:5000` 改为 `5001:5000`，对齐前端硬编码的 `API_BASE = http://localhost:5001`

---

## 模块二：情感分析增强（ECharts / 关键词云 / 痛点检测 / 建议分级 / 表单验证）

### 后端 `backend/app.py`

- `generate_suggestion()` 改为结构化输出 `{text, actions, confidence, level}`，4 级建议：critical / high / moderate / strong
- `POST /api/v1/keywords` — jieba TF-IDF 关键词提取，Top 20 关键词含正/负面文本分布
- `POST /api/v1/pain_points` — 规则匹配痛点检测，6 大类别（产品质量/物流/客服/价格/描述不符/售后），含严重程度和示例

### 前端 `frontend/index.html`

- 引入 ECharts 5.5.0，新增情感趋势折线图 + 情感分布环形图（周/全部切换）
- 侧边栏新增"关键词"tab，正/负/中性着色标签云
- 分析结果区新增痛点面板、建议分级卡片（紧急/重要/建议/好评）
- 表单验证：邮箱格式 + 密码长度校验

### 依赖 `backend/requirements.txt`

- 新增 `jieba==0.42.1`

---

## 模块三：店铺/商品管理系统（SQLite + CRUD API + 前端管理页）

### 新增文件

| 文件 | 说明 |
|------|------|
| `backend/db.py` | SQLite 数据库模块，`shops` + `products` 表（外键级联删除） |
| `backend/data/yalu_shop.csv` | 雅鹿正品男女服饰折扣店 111 条商品（GBK 编码） |

### 数据库 `backend/db.py`

使用 SQLite + WAL 模式 + 外键约束。

**Shop CRUD:** `create_shop()`, `get_shops()` (带 `LEFT JOIN` 商品计数), `get_shop()`, `delete_shop()` (级联删商品), `import_products_for_shop()`

**Product CRUD:** `get_products()` (店铺筛选/关键词搜索/分页), `get_product()`, `add_product()`, `delete_product()`

### API 端点 `backend/app.py`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/shops` | 店铺列表（分页） |
| POST | `/api/v1/shops` | 创建店铺 |
| GET | `/api/v1/shops/<id>` | 店铺详情 |
| DELETE | `/api/v1/shops/<id>` | 删除店铺（级联删商品） |
| GET | `/api/v1/shops/presets` | 列出可导入预设店铺 |
| POST | `/api/v1/shops/presets/import` | 一键导入预设店铺及 CSV 商品 |
| GET | `/api/v1/products` | 商品列表（shop_id/keyword/page/page_size） |
| GET | `/api/v1/products/<id>` | 商品详情 |
| POST | `/api/v1/products` | 添加商品 |
| DELETE | `/api/v1/products/<id>` | 删除商品 |

### 前端 `frontend/index.html`

- "数据源"tab 重构：店铺卡片（名称/平台色标/商品数）+ 商品表格（名称/评价数/淘宝链接/分析按钮）
- 关键词搜索 + 分页控件 + 模拟评论生成（`generateProductReviews()`）
- 店铺导入模态框：预设店铺 tab（一键导入雅鹿）+ 手动创建 tab
- 多店铺支持：点击切换、选中高亮、删除确认

### Docker 持久化

- `docker-compose.yml` 新增 `db_data` named volume 挂载至 `/app/db`，容器重建不丢数据

---

## 模块四：报告生成与导出

### 功能
- 将当前分析结果（情感分布、关键词、痛点、建议）生成为独立 HTML 报告文件
- 报告内联 CSS，无外部依赖，可离线打开、可打印
- 报告自动下载，同时支持在新标签页预览
- 报告存储到 SQLite，支持历史查看和删除

### 数据库 `backend/db.py`
- 新增 `reports` 表（id, title, total_reviews, positive_count, negative_count, data_json, html_content, created_at）
- `create_report()`, `get_reports()`, `get_report()`, `delete_report()`

### API 端点 `backend/app.py`
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/v1/reports/generate` | 接收分析数据 JSON，生成 HTML 报告，存入 DB |
| GET | `/api/v1/reports` | 报告列表（分页） |
| GET | `/api/v1/reports/<id>` | 报告详情（含完整数据） |
| GET | `/api/v1/reports/<id>/download` | 下载 HTML 报告文件 |
| DELETE | `/api/v1/reports/<id>` | 删除报告 |

报告 HTML 包含：总览卡片（总评价数/正/负/好评率）、关键词标签云、痛点检测表、评价详情表、分级建议。

### 前端 `frontend/index.html`
- 分析完成后结果区展示「📄 生成分析报告」按钮
- `generateReport()` — 从 `allAnalyses` 历史记录收集分析数据，结合 `lastKeywordsData` / `lastPainPointsData`，调用生成接口并自动触发浏览器下载

---

## 模块五：中性情感分类

### 动机

原模型为大众点评二分类（正面/负面），softmax 输出的两个概率非此即彼。当正面 ≈ 负面（概率接近时），模型处于不确定状态，此时强行归类为任一方都会误导。引入概率差阈值判为"中性"。

### 后端 `backend/app.py`

- `NEUTRAL_THRESHOLD = 0.2`：正/负概率差小于此值判为中性
- `EMOTION_MAP` 新增 `"中性"` 条目（😐 一般 / neutral / #718096）
- `analyze_local()` 中 `abs(pos_prob - neg_prob) < 0.2` 时 `prediction = '中性'`，`sentiment` 数组增加中性得分（`1 - gap`）
- `generate_suggestion()` 新增 `neutral` 分支 — 引导进一步了解用户需求
- `build_report_html()` / 报告端点新增 `neutral_count`，报告卡片从 4 列扩至 5 列
- `/api/v1/models` 描述更新为三分类，返回 `neutral_threshold` 参数

### 前端 `frontend/index.html`

- CSS 新增 `.result-icon.neutral`、`.result-bar.neutral .bar-fill`、`.batch-stat.neutral`、`.sentiment-tag.neutral` 样式（#718096 灰色系）
- 单条分析结果区新增"😐 中性"概率条（位于正面与负面之间）
- 批量分析统计新增"中性"计数卡片
- `displayResult()` / `displayBatchResults()` / `updateBatchStats()` 适配三分类统计
- `renderTrendChart()` 新增"中评"折线，`renderDistChart()` 新增"中评"扇形
- 历史记录标签颜色适配三分类（正面绿/负面红/中性灰）
