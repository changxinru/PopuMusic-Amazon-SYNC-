# PopuMusic Amazon → 飞书同步

当前阶段：只做 Amazon → 飞书第一阶段，不做金蝶同步。

## 已完成能力

- 项目结构初始化
- 环境变量配置
- 飞书 tenant_access_token 获取
- 飞书多维表格记录查询和新增封装
- SKU 映射表读取
- sync_key 生成
- 发货 / 退货记录标准化
- dry-run 模拟数据运行
- 同步日志写入封装

## 安装

```bash
npm install
cp .env.example .env
```

## 配置

编辑 `.env`，填写飞书应用和多维表格信息。

第一阶段建议先用 dry-run：

```env
DRY_RUN=true
```

## 运行

拉取昨天数据：

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

## 飞书表字段要求

### Amazon发货明细表

- sync_key
- 数据日期
- 站点
- Amazon订单号
- Amazon SKU
- 金蝶物料编码
- 数量
- 类型
- 仓库
- 金蝶同步状态
- 失败原因
- 原始数据JSON
- 创建时间
- 更新时间

### Amazon退货明细表

- sync_key
- 数据日期
- 站点
- Amazon订单号
- Amazon SKU
- 金蝶物料编码
- 数量
- 类型
- 退货可售状态
- 仓库
- 金蝶同步状态
- 失败原因
- 原始数据JSON
- 创建时间
- 更新时间

### SKU映射表

- Amazon SKU
- 金蝶物料编码
- 金蝶物料名称
- 默认仓库
- 站点
- 是否启用
- 备注

### 同步日志表

- 时间
- 类型
- 站点
- sync_key
- Amazon订单号
- Amazon SKU
- 操作
- 结果
- 错误信息

## 下一步

1. 先配置飞书应用权限。
2. 关闭 dry-run，测试写入一条模拟记录。
3. 确认防重复逻辑有效。
4. 再实现 Amazon SP-API Reports API 真实拉取。
