# Apache Pulsar 中文文档

这是 Apache Pulsar 项目的中文翻译版本。

## 翻译状态

已完成以下版本的中文翻译：

### 当前版本 (docs/)
- [x] 概述 (concepts-overview.md)
- [x] 消息传递 (concepts-messaging.md)
- [x] 本地快速开始 (getting-started-standalone.md)

### 4.0.x 版本
- [x] 概述 (concepts-overview.md)

### 3.0.x 版本
- [x] 概述 (concepts-overview.md)

### 2.10.x 版本
- [x] 概述 (concepts-overview.md)

## 启动中文网站

要运行中文版本的网站，请使用以下命令：

```bash
# 安装依赖
corepack enable
yarn install

# 启动中文版本的开发服务器
yarn start --locale zh-CN --port 3001
```

## 翻译文件结构

翻译文件位于 `i18n/zh-CN/` 目录下：

```
i18n/zh-CN/
├── docusaurus-plugin-content-docs/
│   ├── current/              # 当前版本的翻译
│   ├── version-4.0.x/        # 4.0.x 版本的翻译
│   ├── version-3.0.x/        # 3.0.x 版本的翻译
│   └── version-2.10.x/       # 2.10.x 版本的翻译
└── docusaurus-theme-classic/
    ├── navbar.json           # 导航栏翻译
    └── footer.json           # 页脚翻译
```

## 贡献指南

如果您想为中文翻译做出贡献：

1. 确保保持 Markdown/MDX 的头部元数据格式不变
2. 保持链接和引用的完整性
3. 使用统一的技术术语翻译
4. 确保翻译的准确性和可读性

## 技术说明

- 使用 Docusaurus 的国际化功能
- 支持 4 个版本的并行翻译
- 保持原有的文档结构和链接关系