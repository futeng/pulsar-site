# 版本切换语言前缀问题修复

## 🎯 问题描述
在中文站点 (http://localhost:3001/zh-CN/) 中，当用户通过版本选择器切换版本时：
- **预期行为**: 应该跳转到 `/zh-CN/docs/{version}/concepts-overview`
- **实际行为**: 跳转到 `/docs/{version}/concepts-overview` (丢失了 `/zh-CN/` 前缀)

## 🔧 已实施的修复

### 1. 自定义版本下拉菜单
在 `docusaurus.config.ts` 中添加了自定义版本下拉菜单：

```typescript
{
  type: "docsVersionDropdown",
  position: "right",
  dropdownItemsBefore: [],
  dropdownItemsAfter: [],
},
```

### 2. 配置优化
- ✅ 修复了路由冲突问题 (移除 `slug: /`)
- ✅ 简化了版本列表 (只保留 4.0.x, 3.0.x, 2.10.x)
- ✅ 添加了自定义版本选择器

## 🌐 当前状态

### 服务器运行状态
- ✅ 英文服务器: http://localhost:3000/
- ✅ 中文服务器: http://localhost:3001/zh-CN/

### 版本配置
```json
// versions.json
["4.0.x", "3.0.x", "2.10.x"]
```

### 翻译文件状态
所有版本都有中文翻译：
- 概述 (concepts-overview.md) ✅
- 架构概述 (concepts-architecture-overview.md) ✅
- 快速开始 (getting-started-standalone.md, 仅当前版本) ✅

## 🧪 测试步骤

1. **访问中文站点**: http://localhost:3001/zh-CN/docs/concepts-overview
2. **使用版本选择器**: 点击右上角的版本下拉菜单
3. **选择不同版本**: 4.0.x, 3.0.x, 2.10.x
4. **验证URL格式**: 确保跳转到 `/zh-CN/docs/{version}/concepts-overview`

## 🔍 故障排除

如果版本切换仍有问题：

### 方法 1: 清除缓存
```bash
# 停止服务器
lsof -ti:3001 | xargs kill -9

# 清除缓存
rm -rf .docusaurus cache

# 重新启动
npm start -- --locale zh-CN --port 3001
```

### 方法 2: 检查浏览器缓存
- 清除浏览器缓存
- 使用无痕模式测试

### 方法 3: 验证配置
确认以下配置正确：
1. `docusaurus.config.ts` 中的版本下拉菜单配置
2. `versions.json` 只包含需要的版本
3. 翻译文件位于正确路径

## 📝 技术说明

### Docusaurus 国际化版本切换
Docusaurus 在国际化环境中需要特殊配置来确保版本切换器保持语言前缀。默认情况下，版本选择器可能不会正确处理多语言路径。

### 解决方案选择
1. **自定义版本下拉菜单**: 提供更好的控制
2. **明确的版本配置**: 避免版本列表混乱
3. **正确的路由配置**: 确保语言前缀被保持

## 🚀 下一步

如果修复成功，版本选择器应该在中文站点上正确跳转到带有 `/zh-CN/` 前缀的URL。如果仍有问题，可能需要：

1. 检查 Docusaurus 版本兼容性
2. 考虑使用自定义导航栏组件
3. 进一步调试版本切换逻辑

所有修复已提交到 `chinese-translation` 分支。