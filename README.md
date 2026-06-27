# 宏利记账（Obsidian 插件）

在 Obsidian 中记账与查看账户余额，与桌面端共享 iCloud JSONL 数据。

> 本仓库仅包含 Obsidian 插件的**安装产物**：`main.js`、`manifest.json`、`styles.css`。

## 安装

### 方式一：BRAT 安装（推荐）

1. 在 Obsidian 社区插件中搜索并安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件。
2. 打开 BRAT 设置 → 点击 **Add Beta plugin**。
3. 输入仓库地址 `https://github.com/taptapon/honey-ledger`，点击 **Add Plugin**。
4. 安装完成后，在第三方插件列表中启用「宏利记账」。

> BRAT 会自动检测新版本并更新。

### 方式二：手动安装

1. 从 [Releases](https://github.com/taptapon/honey-ledger/releases) 下载最新版本的 `main.js`、`manifest.json`、`styles.css`。
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

## 发布新版本

1. 修改 `manifest.json` 中的 `version` 字段（如 `"0.2.0"`）。
2. 替换仓库中的 `main.js`、`styles.css` 等文件。
3. 执行一键发布脚本：

```bash
./release.sh
```

脚本会自动完成：提交更改 → 推送代码 → 创建 tag → 发布 GitHub Release（附带插件文件）。

> 前提：已安装 [gh](https://cli.github.com/) 并登录。

## 与桌面端共享数据

数据格式与桌面端（macOS）完全一致。把桌面端的「账本」指向 Obsidian 库根目录、数据子目录名设为一致，即可通过 iCloud 在两端共享同一份数据。
