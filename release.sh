#!/bin/bash
set -e

cd "$(dirname "$0")"

# 从 manifest.json 读取版本号
VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")

if [ -z "$VERSION" ]; then
  echo "错误：无法从 manifest.json 读取版本号"
  exit 1
fi

echo "当前版本：$VERSION"

# 检查是否已有同名 tag
if git tag -l "$VERSION" | grep -q "$VERSION"; then
  echo "错误：tag $VERSION 已存在，请先更新 manifest.json 中的版本号"
  exit 1
fi

# 提交所有更改
echo "提交更改..."
git add -A
git commit -m "release: v$VERSION" || echo "没有需要提交的更改"

# 推送
echo "推送代码..."
git push

# 创建 tag 并发布 Release
echo "发布 Release v$VERSION ..."
gh release create "$VERSION" ./main.js ./manifest.json ./styles.css \
  --title "v$VERSION" \
  --notes "v$VERSION"

echo "发布完成！"
echo "https://github.com/taptapon/honey-ledger/releases/tag/$VERSION"
