# 宏利记账（Obsidian 插件）

在 Obsidian 中记账与查看账户余额，与桌面端共享 iCloud JSONL 数据。

> 本仓库仅包含 Obsidian 插件的**安装产物**：`main.js`、`manifest.json`、`styles.css`。

## 安装

1. 下载本仓库的 `main.js`、`manifest.json`、`styles.css` 三个文件。
2. 在你的 Obsidian 库下新建目录 `.obsidian/plugins/accounting/`，将三个文件放入其中。
3. Obsidian → 设置 → 第三方插件 → 关闭「安全模式」→ 启用「宏利记账」。

> 移动端若使用 `.obsidian-mobile`，请同样放到对应配置目录的 `plugins/accounting/` 下。

## 数据位置

插件在库目录下读写数据子目录（默认 `data`）：

```
<库>/<dataSubdir>/
├── transactions.jsonl   追加式事件日志（单一数据源）
├── accounts.json        账户元数据
├── categories.json      分类
├── account-types.json   账户类型分组
├── ledger.json          账本别名
└── recurring.json       周期账规则
```

## 与桌面端共享数据

数据格式与桌面端（macOS）完全一致。把桌面端的「账本」指向 Obsidian 库根目录、数据子目录名设为一致，即可通过 iCloud 在两端共享同一份数据。
