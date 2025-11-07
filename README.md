# Wolf Blog - 狼屋博客

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个现代化的博客前端项目，基于 Nuxt 4 和 Nuxt UI 构建，提供丰富的博客功能和优秀的用户体验。

[访问 Wolf Blog - 狼屋博客](https://wolfblog.cn)

## 技术栈

- **框架**: Nuxt 4 (Vue 3)
- **语言**: TypeScript
- **UI 库**: Nuxt UI (基于 Tailwind CSS)
- **状态管理**: Pinia
- **工具库**: VueUse
- **其他**: Nuxthub Core, md-editor-v3

## SEO 优化

项目已实现全面的搜索引擎优化：

- ✅ **Meta 标签优化**：完整的 title、description、keywords 设置
- ✅ **Open Graph 协议**：支持 Facebook、LinkedIn 等社交平台分享
- ✅ **Twitter Card**：优化 Twitter 分享效果
- ✅ **结构化数据**：使用 JSON-LD 格式的结构化数据
- ✅ **Canonical URL**：防止重复内容问题
- ✅ **Robots.txt**：搜索引擎爬虫指导文件
- ✅ **站点地图**：XML 格式的站点地图
- ✅ **响应式设计**：移动端友好，提升移动搜索排名
- ✅ **页面速度优化**：资源压缩、预加载等性能优化

### SEO 配置

主要 SEO 配置位于：

- `nuxt.config.ts` - 全局 SEO 设置
- `app/composables/useSeo.ts` - SEO 组合式函数
- `public/robots.txt` - 爬虫规则
- `public/sitemap.xml` - 站点地图

## 快速开始

### 环境要求

- Node.js 24+
- pnpm 10+
- Git

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

配置以下环境变量：

- `NUXT_PUBLIC_API_BASE`: API 基础 URL（默认值）
- `NUXT_PUBLIC_API_BASE_CLIENT`: 客户端 API 基础 URL（覆盖 API_BASE）
- `NUXT_PUBLIC_API_BASE_SERVER`: 服务端 API 基础 URL（覆盖 API_BASE）

**注意**：需要确保后端 API 服务已启动并可访问。

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

# 清理缓存
pnpm clean
```

## 代码规范

项目使用 ESLint 和 Prettier 进行代码检查和格式化。请在提交代码前运行：

```bash
pnpm lint
pnpm format
```

## 项目结构

```
├── app/                    # Nuxt 应用目录
│   ├── apis/              # API 调用封装
│   │   ├── article/       # 文章相关 API
│   │   ├── favorite.ts    # 收藏 API
│   │   └── user.ts        # 用户 API
│   ├── assets/            # 静态资源
│   │   ├── css/           # 样式文件
│   │   └── icons/         # 图标文件
│   ├── components/        # Vue 组件
│   │   ├── article/       # 文章相关组件
│   │   ├── user/          # 用户相关组件
│   │   └── NavigationMenuHeader.vue
│   ├── composables/       # Vue 组合式函数
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面路由
│   │   ├── articles/      # 文章页面
│   │   ├── user/          # 用户页面
│   │   └── about/         # 关于页面
│   ├── plugins/           # Nuxt 插件
│   └── stores/            # Pinia 状态管理
├── server/                # 服务端代码
│   └── api/               # 服务端 API
├── shared/                # 共享代码
│   ├── constants/         # 常量定义
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── public/                # 公共静态文件
├── eslint.config.mjs      # ESLint 配置
├── nuxt.config.ts         # Nuxt 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 部署

### 静态站点部署

1. 构建生产版本：

   ```bash
   pnpm build --dotenv .env.production
   ```

2. 将 `.output/public` 目录部署到静态文件服务器。

### Node.js 部署

参考 [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment) 进行部署。

## 参与项目

欢迎提交 Issue 和 Pull Request！

欢迎 PR 代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 开发设置

1. 克隆仓库：`git clone https://github.com/your-username/wolf-blog-frontend.git`
2. 安装依赖：`pnpm install`
3. 启动开发服务器：`pnpm dev`

### 提交规范

请使用 [Conventional Commits](https://conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或工具配置

## 常见问题

### Q: 如何配置 API 端点？

A: 在 `.env.development` 或 `.env.production` 文件中设置 `NUXT_PUBLIC_API_BASE` 等变量。

### Q: 开发时遇到类型错误怎么办？

A: 运行 `pnpm typecheck` 检查类型错误，或运行 `pnpm prepare` 重新生成类型。

### Q: 如何添加新的页面？

A: 在 `app/pages/` 目录下创建 `.vue` 文件，Nuxt 会自动生成路由。

### Q: 如何自定义主题？

A: 修改 `app/app.config.ts` 中的 Nuxt UI 配置。
