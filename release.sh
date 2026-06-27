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

# 创建 tag 并发布 GitHub Release
echo "发布 GitHub Release v$VERSION ..."
gh release create "$VERSION" ./main.js ./manifest.json ./styles.css \
  --title "v$VERSION" \
  --notes "v$VERSION"

echo "GitHub Release 发布完成！"
echo "https://github.com/taptapon/honey-ledger/releases/tag/$VERSION"

# 发布 Gitee Release
if [ -n "$GITEE_TOKEN" ]; then
  echo "发布 Gitee Release v$VERSION ..."
  GITEE_OWNER="fadgabadfaf"
  GITEE_REPO="honey-ledger"
  GITEE_API="https://gitee.com/api/v5/repos/$GITEE_OWNER/$GITEE_REPO"

  # 创建 Release
  RELEASE_RESP=$(curl -s -X POST "$GITEE_API/releases" \
    -H "Content-Type: application/json" \
    -d "{
      \"access_token\": \"$GITEE_TOKEN\",
      \"tag_name\": \"$VERSION\",
      \"name\": \"v$VERSION\",
      \"body\": \"v$VERSION\",
      \"target_commitish\": \"main\"
    }")

  RELEASE_ID=$(echo "$RELEASE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")

  if [ -n "$RELEASE_ID" ]; then
    # 上传附件
    for FILE in main.js manifest.json styles.css; do
      echo "  上传 $FILE ..."
      curl -s -X POST "$GITEE_API/releases/$RELEASE_ID/attach_files" \
        -F "access_token=$GITEE_TOKEN" \
        -F "file=@$FILE" > /dev/null
    done
    echo "Gitee Release 发布完成！"
    echo "https://gitee.com/$GITEE_OWNER/$GITEE_REPO/releases/tag/$VERSION"
  else
    echo "Gitee Release 创建失败，请检查 GITEE_TOKEN 是否正确"
  fi
else
  echo "跳过 Gitee Release（未设置 GITEE_TOKEN 环境变量）"
fi
