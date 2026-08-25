# 耶克站 · Netlify 部署说明（支持在线编辑）

这个文件夹专为 **Netlify** 准备，包含后端函数（`netlify/functions/`），**拖拽上传即可**，在线编辑能用。

## 部署步骤

1. 打开 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把整个 **`yeke-netlify`** 文件夹拖进去
3. 等它构建完成（会自动安装依赖并部署函数）
4. 得到网址如 `xxx.netlify.app`，打开即可

> 如果之前已经有 Netlify 项目，在项目后台也能直接上传新文件夹更新。

## 在线编辑

打开你的 `xxx.netlify.app`，每页顶部「🔒 进入编辑模式」→ 密码 `132457`：
- 写文章、传照片、改 OC、改简介，保存即生效
- 数据存在 Netlify 的 Blobs 云存储里

## 目录结构

```
├── index.html / css / js / pages / data / assets / ocfiles  网站本体
├── netlify/functions/   后端（保存、上传、图片）
├── netlify.toml         路径映射（/api/* → 函数）
└── package.json         依赖（@netlify/blobs）
```

## 密码

管理员密码：`132457`（改密码要同步改 `netlify/functions/*.js` 和 `js/main.js`）
