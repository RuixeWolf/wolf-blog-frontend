# Wolf Blog

一个现代化的博客前端项目，基于 Nuxt 4 和 Nuxt UI 构建，提供丰富的博客功能和优秀的用户体验。

## 技术栈

- **框架**: Nuxt 4 (Vue 3)
- **语言**: TypeScript
- **UI 库**: Nuxt UI (基于 Tailwind CSS)
- **状态管理**: Pinia
- **工具库**: VueUse
- **其他**: Nuxthub Core

## 功能特性

- 📝 文章管理（创建、编辑、查看）
- 👤 用户系统（登录、注册、个人资料）
- 💬 评论系统
- ⭐ 收藏和点赞功能
- 🏷️ 标签和分区管理
- 📱 响应式设计
- 🔍 搜索功能
- 🎨 现代化 UI 界面

## 快速开始

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境配置

创建环境配置文件：

```bash
# 开发环境
cp .env.example .env.development

# 生产环境
cp .env.example .env.production
```

配置 API 端点：

- `NUXT_PUBLIC_API_BASE`: API 基础 URL
- `NUXT_PUBLIC_API_BASE_CLIENT`: 客户端 API 基础 URL（覆盖 API_BASE）
- `NUXT_PUBLIC_API_BASE_SERVER`: 服务端 API 基础 URL（覆盖 API_BASE）

### 开发服务器

启动开发服务器：

```bash
pnpm dev --host --dotenv .env.development
```

访问 `http://localhost:3000` 查看应用。

### 构建生产版本

```bash
pnpm build --dotenv .env.production
```

### 预览生产构建

```bash
pnpm preview
```

## 开发命令

```bash
# 类型检查
pnpm typecheck

# 代码检查和格式化
pnpm lint
pnpm format

# 准备 Nuxt 项目
pnpm prepare
```

## 项目结构

```
app/
├── apis/           # API 调用封装
├── components/     # Vue 组件
├── composables/    # Vue 组合式函数
├── layouts/        # 布局组件
├── pages/          # 页面路由
├── plugins/        # Nuxt 插件
└── stores/         # Pinia 状态管理

shared/
├── constants/      # 常量定义
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
```

## 部署

参考 [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment) 进行部署。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
