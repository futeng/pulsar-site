# Apache Pulsar 文档翻译计划

## 概览
- **总文档数**: 289 个 markdown 文件
- **分配方案**: 3 台机器，每台约 96 个文档
- **术语表**: `scripts/glossary.json`

## 机器 1 (文档 1-96)
包含以下类型的文档：
- about.md ✅ (已翻译)
- admin-api-*.md (管理 API 相关)
- adaptors-*.md (适配器相关)

## 机器 2 (文档 97-192)
包含以下类型的文档：
- administration-*.md (管理相关)
- client-libraries-*.md (客户端库)
- concepts-*.md (概念相关)

## 机器 3 (文档 193-289)
包含以下类型的文档：
- cookbooks-*.md (食谱/教程)
- functions-*.md (Pulsar Functions)
- getting-started-*.md (快速开始)
- io-*.md (Pulsar IO)
- security-*.md (安全相关)
- 其他剩余文档

## 翻译指南

### 基本规则
1. 严格参考术语表 `scripts/glossary.json`
2. 保持原有的 markdown 格式和代码块
3. 不要翻译代码示例、命令、配置键名
4. 保持链接和引用的完整性

### 文件命名
- 将英文文档翻译为中文
- 放置在 `i18n/zh-cn/docusaurus-plugin-content-docs/current/` 目录下
- 保持相同的文件名

### 质量要求
- 准确传达原文意思
- 使用统一的技术术语
- 保持语言简洁清晰
- 符合中文技术文档表达习惯

### 验证方式
- 翻译完成后运行 `npm run build` 验证
- 确保没有语法错误
- 检查链接是否正常

## 进度跟踪
- [ ] 机器 1: 0/96 完成
- [ ] 机器 2: 0/96 完成
- [ ] 机器 3: 0/97 完成
- [ ] 总体: 1/289 完成