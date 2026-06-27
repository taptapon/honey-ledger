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

# 发布 GitCode Release
if [ -n "$GITCODE_TOKEN" ]; then
  echo "发布 GitCode Release v$VERSION ..."
  GITCODE_OWNER="fadgabadfaf"
  GITCODE_REPO="honey-ledger"
  GITCODE_API="https://api.gitcode.com/api/v5/repos/$GITCODE_OWNER/$GITCODE_REPO"

  # 创建 Release
  RELEASE_RESP=$(curl -s -X POST "$GITCODE_API/releases" \
    -H "Content-Type: application/json" \
    -d "{
      \"access_token\": \"$GITCODE_TOKEN\",
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
      # 获取上传地址
      UPLOAD_URL=$(curl -s -X GET "$GITCODE_API/releases/$VERSION/upload_url" \
        -G -d "access_token=$GITCODE_TOKEN" -d "file_name=$FILE" \
        | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))" 2>/dev/null || echo "")
      if [ -n "$UPLOAD_URL" ]; then
        curl -s -X PUT "$UPLOAD_URL" \
          -H "Content-Type: application/octet-stream" \
          --data-binary @"$FILE" > /dev/null
      fi
    done
    echo "GitCode Release 发布完成！"
    echo "https://gitcode.com/$GITCODE_OWNER/$GITCODE_REPO/releases/tag/$VERSION"
  else
    echo "GitCode Release 创建失败，请检查 GITCODE_TOKEN 是否正确"
    echo "$RELEASE_RESP"
  fi
else
  echo "跳过 GitCode Release（未设置 GITCODE_TOKEN 环境变量）"
fi
