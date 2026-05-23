# PopuMusic Amazon → 飞书同步 Phase 1

当前阶段只做 **Amazon → 飞书电子表格**，不做金蝶同步。

本版本使用你现有的飞书 Wiki 电子表格，不使用多维表格 Bitable。

## 现有表格

- 发货 sheet_id：`jjsqwc`
- 退货 sheet_id：`aeZUjb`
- SKU 映射 sheet_id：`Ujr1LB`
- Wiki token：`FmDSwrmswiXKXPkvkdvcJkpJnjc`

程序会优先使用 `FEISHU_SPREADSHEET_TOKEN`。如果它为空，则通过 `FEISHU_WIKI_TOKEN` 自动解析真实 spreadsheet token。

## 安装

```bash
npm install
```

## 配置

复制环境变量文件：

```bash
cp .env.example .env
```

Windows 可以直接复制 `.env.example` 并改名为 `.env`。

先填写飞书应用：

```env
FEISHU_APP_ID=cli_xxxxx
FEISHU_APP_SECRET=xxxxx
FEISHU_WIKI_TOKEN=FmDSwrmswiXKXPkvkdvcJkpJnjc
FEISHU_SPREADSHEET_TOKEN=
FEISHU_SHIPMENT_SHEET_ID=jjsqwc
FEISHU_RETURN_SHEET_ID=aeZUjb
FEISHU_SKU_MAPPING_SHEET_ID=Ujr1LB
```

Amazon 配置第一阶段可先留空，因为现在默认 dry-run 模拟数据。

## 运行 dry-run

```bash
npm run sync:amazon-to-feishu -- --dry-run
```

指定日期：

```bash
npm run sync:amazon-to-feishu -- --start=2026-05-22 --end=2026-05-22 --dry-run
```

只跑发货：

```bash
npm run sync:amazon-to-feishu -- --type=shipment --dry-run
```

只跑退货：

```bash
npm run sync:amazon-to-feishu -- --type=return --dry-run
```

## 真实写入飞书

确认 `.env` 里已填写：

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_WIKI_TOKEN=FmDSwrmswiXKXPkvkdvcJkpJnjc
FEISHU_SHIPMENT_SHEET_ID=jjsqwc
FEISHU_RETURN_SHEET_ID=aeZUjb
FEISHU_SKU_MAPPING_SHEET_ID=Ujr1LB
DRY_RUN=false
```

然后运行：

```bash
npm run sync:amazon-to-feishu
```

## 表头要求

发货表第一行建议包含：

```text
sync_key, 数据日期, 站点, Amazon订单号, Amazon SKU, 金蝶物料编码, 数量, 类型, 仓库, 金蝶同步状态, 失败原因, 原始数据JSON, 更新时间
```

退货表第一行建议包含：

```text
sync_key, 数据日期, 站点, Amazon订单号, Amazon SKU, 金蝶物料编码, 数量, 类型, 退货可售状态, 仓库, 金蝶同步状态, 失败原因, 原始数据JSON, 更新时间
```

SKU 映射表第一行建议包含：

```text
Amazon SKU, 金蝶物料编码, 金蝶物料名称, 默认仓库, 站点, 是否启用, 备注
```

## 当前实现内容

- 环境变量配置
- 飞书 tenant access token 获取
- Wiki token 自动解析 spreadsheet token
- 读取 SKU 映射表
- 发货/退货模拟数据 dry-run
- sync_key 生成
- 写入前检查 sync_key 防重复
- SKU 未匹配时写入异常状态
- 日志输出到控制台

## 后续阶段

1. 接入 Amazon SP-API Reports API
2. 把真实发货/退货报表解析成统一结构
3. 稳定后再做飞书 → 金蝶云同步
