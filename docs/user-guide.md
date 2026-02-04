# OpenClaw Cloud 用户指南

欢迎使用OpenClaw Cloud！本指南将帮助您快速上手并充分利用平台的各项功能。

## 📖 目录

1. [快速开始](#快速开始)
2. [Dashboard概览](#dashboard概览)
3. [管理OpenClaw实例](#管理openclaw实例)
4. [AI智能对话](#ai智能对话)
5. [插件管理](#插件管理)
6. [Skills市场](#skills市场)
7. [Skills集合](#skills集合)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)

## 🚀 快速开始

### 首次登录

1. 打开浏览器访问OpenClaw Cloud
2. 如果配置了Manus OAuth，点击"登录"按钮
3. 完成认证后，您将看到Dashboard页面

### 创建第一个实例

1. 在Dashboard点击"Create Instance"
2. 填写实例名称和描述
3. 点击"Create"按钮
4. 实例创建成功后，您可以在"Recent Instances"中看到它

### 安装第一个Skill

1. 点击侧边栏的"Skills"进入Skills市场
2. 浏览或搜索您需要的Skill
3. 点击Skill卡片查看详情
4. 选择要安装到的实例
5. 点击"Install"按钮

## 📊 Dashboard概览

Dashboard是您的控制中心，提供平台的整体概况。

### 统计卡片

Dashboard顶部显示四个关键指标：

- **Active Instances**: 正在运行的实例数量
- **Installed Plugins**: 已安装的插件数量
- **Available Skills**: 可用的Skills总数
- **Enabled Plugins**: 已启用的插件数量

### Recent Instances

显示最近创建的OpenClaw实例，包括：
- 实例名称
- 状态（running/stopped）
- 描述信息

点击实例可以查看详情和进行管理。

### Quick Actions

提供常用操作的快捷入口：
- **Create Instance**: 创建新的OpenClaw实例
- **Browse Skills**: 浏览Skills市场
- **Manage Plugins**: 管理插件

## 🤖 管理OpenClaw实例

### 创建实例

1. 点击"Instances"进入实例管理页面
2. 点击"Create New Instance"按钮
3. 填写表单：
   - **Name**: 实例名称（必填）
   - **Description**: 实例描述（可选）
   - **Port**: 端口号（可选，默认自动分配）
   - **Config**: JSON格式的配置（可选）
4. 点击"Create Instance"保存

### 查看实例详情

在实例列表中点击实例卡片，可以查看：
- 实例基本信息
- 运行状态
- 配置详情
- 已安装的Skills

### 启动/停止实例

1. 在实例卡片上找到状态按钮
2. 点击"Start"启动实例
3. 点击"Stop"停止实例

实例状态会实时更新。

### 编辑实例

1. 点击实例卡片进入详情页
2. 点击"Edit"按钮
3. 修改名称、描述或配置
4. 点击"Save"保存更改

### 删除实例

1. 点击实例卡片进入详情页
2. 点击"Delete"按钮
3. 确认删除操作

**注意**: 删除实例将同时删除该实例上安装的所有Skills。

## 💬 AI智能对话

OpenClaw Cloud 提供了强大的AI智能对话功能，让您可以直接与运行中的实例进行交互。

### 进入对话页面

1. 点击侧边栏的 "AI Chat" 图标。
2. 选择一个正在运行的实例。
3. 开始对话！

### 功能特性

- **实时对话**: 与您的AI智能体进行实时问答。
- **Markdown支持**: 对话内容支持Markdown渲染，包括代码块、列表、表格等。
- **快捷提示**: 使用预设的快捷提示快速发起常见任务。
- **对话历史**: 完整的对话历史记录，方便追溯。

### 使用技巧

- **选择正确的实例**: 确保您选择了正确的实例进行对话。
- **清晰的指令**: 给出清晰、具体的指令，以便AI更好地理解您的意图。
- **利用快捷提示**: 快捷提示可以帮助您快速了解如何管理实例、安装技能等。

## 🔌 插件管理

插件扩展OpenClaw Cloud的功能，支持不同的通道、部署方式和监控工具。

### 插件类型

OpenClaw Cloud支持四种类型的插件：

1. **Channel Plugins**: 消息平台支持（Matrix、XMPP、ActivityPub等）
2. **Deployment Plugins**: 部署工具集成（Docker、Kubernetes等）
3. **Monitoring Plugins**: 监控和分析工具（Prometheus、Grafana等）
4. **Skill Provider Plugins**: Skills来源集成

### 浏览插件

1. 点击"Plugins"进入插件管理页面
2. 查看已安装的插件列表
3. 点击"Browse Available Plugins"查看可用插件

### 安装插件

1. 在可用插件列表中找到需要的插件
2. 点击"Install"按钮
3. 填写插件配置（根据插件要求）
4. 点击"Save"完成安装

### 配置插件

1. 在已安装插件列表中找到插件
2. 点击"Configure"按钮
3. 修改配置参数
4. 点击"Save"保存更改

插件配置会根据插件的`configSchema`动态生成表单。

### 启用/禁用插件

1. 在插件卡片上找到开关按钮
2. 切换开关以启用或禁用插件

禁用的插件不会运行，但配置会保留。

### 卸载插件

1. 点击插件卡片进入详情页
2. 点击"Uninstall"按钮
3. 确认卸载操作

## 🛍️ Skills市场

Skills市场集成了awesome-openclaw-skills，提供700+个社区Skills。

### 浏览Skills

1. 点击"Skills"进入Skills市场
2. 查看所有可用的Skills
3. 使用分类筛选（Web开发、DevOps、AI等）

### 搜索Skills

1. 在搜索框中输入关键词
2. 系统会实时过滤匹配的Skills
3. 可以搜索名称、描述、作者等字段

### 查看Skill详情

点击Skill卡片查看：
- Skill名称和描述
- 作者信息
- 下载量和评分
- 安装方式
- 源代码链接
- 文档链接

### 安装Skill

1. 在Skill详情页点击"Install"
2. 选择要安装到的实例
3. 点击"Confirm"开始安装
4. 等待安装完成

安装过程包括：
- 下载Skill包
- 验证依赖
- 安装到实例
- 配置Skill

### 卸载Skill

1. 进入实例详情页
2. 在已安装Skills列表中找到Skill
3. 点击"Uninstall"按钮
4. 确认卸载操作

### 同步Skills

Skills会自动从some-openclaw-skills同步，您也可以手动同步：

1. 在Skills页面点击"Sync Skills"按钮
2. 等待同步完成
3. 查看新增的Skills

### 创建自定义Skill

OpenClaw Cloud支持创建自定义Skill，让您可以为自己的实例编写专属的指令和上下文。

**创建步骤**:

1. 在Skills页面点击"Create Custom Skill"按钮
2. 填写表单：
   - **Skill Name**: Skill名称（必填，使用小写字母和连字符）
   - **Description**: Skill描述（必填）
   - **Category**: Skill分类（必选）
   - **Skill Content**: Markdown格式的Skill内容（必填）
3. 使用编辑器编写Skill内容：
   - **Edit模式**: 仅显示编辑区
   - **Split模式**: 同时显示编辑区和预览区
   - **Preview模式**: 仅显示预览区
4. 点击右上角的全屏按钮可以切换全屏/缩小模式
5. 点击"Create Skill"保存

**Skill内容格式**:

自定义Skill使用Markdown格式，建议包含以下部分：

```markdown
# Skill Name

Brief description of the skill.

## Purpose

Explain what this skill helps the agent accomplish.

## Instructions

1. Step-by-step instructions
2. Guidelines for the agent
3. Best practices

## Examples

\`\`\`
Example code or commands
\`\`\`

## Notes

- Important considerations
- Limitations or warnings
```

### 编辑自定义Skill

1. 在Skills页面找到您的自定义Skill（带有"Custom"标识）
2. 点击卡片上的"Edit"按钮
3. 修改Skill内容
4. 点击"Save Changes"保存

### 删除自定义Skill

1. 在Skills页面找到您的自定义Skill
2. 点击卡片上的"Delete"按钮
3. 确认删除操作

**注意**: 删除Skill会同时从所有实例中卸载该Skill。

### 导出自定义Skill

1. 在Skills页面找到您的自定义Skill
2. 点击卡片上的"Export"按钮（下载图标）
3. Skill将以`.md`文件形式下载，包含metadata和内容

### 导入自定义Skill

1. 在Skills页面点击"Import Skills"按钮
2. 点击或拖拽`.md`文件到上传区域
3. 系统会自动解析文件并提取metadata
4. 点击"Import"完成导入

**支持的文件格式**:
- Markdown文件（`.md`）
- 带有frontmatter metadata的Markdown文件

### 分享自定义Skill

1. 在Skills页面找到您的自定义Skill
2. 点击卡片上的"Share"按钮
3. 在对话框中查看：
   - **分享链接**: 复制并分享给其他用户
   - **二维码**: 扫描二维码快速访问
4. 点击"Copy Link"复制链接

**接收分享的Skill**:

1. 打开分享链接
2. 查看Skill预览信息
3. 点击"Install"按钮
4. 选择目标实例
5. 确认安装

## 📦 Skills集合

Skills集合允许您将相关的Skills组合在一起，方便批量管理。

### 创建集合

1. 点击"Collections"进入集合管理页面
2. 点击"Create New Collection"按钮
3. 填写表单：
   - **Name**: 集合名称
   - **Description**: 集合描述
   - **Skills**: 选择要包含的Skills
4. 点击"Create"保存

### 使用集合

创建集合后，您可以：
- 一键安装集合中的所有Skills
- 分享集合给其他用户
- 导出集合配置

### 批量安装Skills

1. 在集合详情页点击"Install All"
2. 选择目标实例
3. 点击"Confirm"开始批量安装
4. 查看安装进度

系统会并行安装所有Skills，并显示每个Skill的安装状态。

### 编辑集合

1. 点击集合卡片进入详情页
2. 点击"Edit"按钮
3. 修改名称、描述或Skills列表
4. 点击"Save"保存更改

### 删除集合

1. 点击集合卡片进入详情页
2. 点击"Delete"按钮
3. 确认删除操作

**注意**: 删除集合不会卸载已安装的Skills。

## 💡 最佳实践

### 实例管理

1. **合理命名**: 使用描述性的名称，如"production-agent"、"test-agent"
2. **添加描述**: 记录实例的用途和配置信息
3. **定期备份**: 导出实例配置以便恢复
4. **监控资源**: 关注实例的CPU和内存使用情况

### 插件使用

1. **按需安装**: 只安装需要的插件，避免资源浪费
2. **及时更新**: 定期检查插件更新
3. **测试配置**: 在测试实例上验证插件配置
4. **阅读文档**: 安装前仔细阅读插件文档

### Skills管理

1. **分类组织**: 使用集合管理相关的Skills
2. **定期清理**: 卸载不再使用的Skills
3. **查看评分**: 优先选择高评分的Skills
4. **阅读文档**: 了解Skill的功能和使用方法
5. **使用内置Skills**: 优先使用Built-in标识的Skills，它们经过官方测试和优化

### 使用Aider Coding Assistant

Aider Coding Assistant是OpenClaw Cloud的内置Skill，提供AI编程助手功能。

**功能特点**:
- AI自动编写和修改代码
- 支持多种编程语言
- 集成Git版本控制
- 支持架构师模式进行系统设计

**安装步骤**:
1. 进入Skills市场
2. 搜索"Aider Coding Assistant"（带有Built-in标识）
3. 点击Install并选择目标实例
4. 等待安装完成

**使用示例**:

安装后，OpenClaw实例可以使用aider命令进行代码编写：

```bash
# 编辑特定文件
aider --model deepseek --yes-always --message "添加错误处理" api.py

# 创建新文件
aider --model deepseek --yes-always --message "创建REST API服务器" server.py

# 架构师模式（复杂功能）
aider --model deepseek --yes-always --architect --message "设计支付系统"
```

**配置要求**:
- 实例中需要安装Python和pip
- 需要配置LLM API密钥（DEEPSEEK_API_KEY、OPENAI_API_KEY等）
- 项目需要是Git仓库

**最佳实践**:
1. 使用前先提交代码到Git
2. 提供清晰具体的任务描述
3. 一次只执行一个任务
4. 使用`git diff`查看更改
5. 复杂任务使用`--architect`模式

### 安全建议

1. **使用强密码**: 确保数据库和应用使用强密码
2. **限制访问**: 使用防火墙限制访问
3. **定期备份**: 备份数据库和配置文件
4. **监控日志**: 定期检查应用日志

## ❓ 常见问题

### 实例无法启动

**问题**: 点击"Start"后实例状态仍然是"stopped"

**解决方案**:
1. 检查实例配置是否正确
2. 查看应用日志
3. 确认端口没有被占用
4. 检查数据库连接

### Skill安装失败

**问题**: Skill安装过程中出现错误

**解决方案**:
1. 检查网络连接
2. 确认实例状态正常
3. 查看错误信息
4. 尝试重新安装

### 插件配置无效

**问题**: 修改插件配置后不生效

**解决方案**:
1. 确认配置格式正确
2. 重启相关实例
3. 检查插件是否已启用
4. 查看插件文档

### 无法访问Skills市场

**问题**: Skills页面显示"无法加载"

**解决方案**:
1. 检查网络连接
2. 尝试手动同步Skills
3. 检查GitHub访问是否正常
4. 查看应用日志

### 数据丢失

**问题**: 实例或配置数据丢失

**解决方案**:
1. 检查数据库连接
2. 恢复最近的备份
3. 查看数据库日志
4. 联系技术支持

## 📞 获取帮助

如果本指南没有解决您的问题：

1. 查看[部署文档](./deployment.md)
2. 查看[插件开发指南](./plugin-development.md)
3. 搜索[GitHub Issues](https://github.com/yourusername/openclaw-cloud/issues)
4. 加入[Discord社区](https://discord.gg/openclaw)
5. 提交[新Issue](https://github.com/yourusername/openclaw-cloud/issues/new)

## 🎓 进阶主题

### 开发自定义插件

如果您想开发自己的插件，请阅读[插件开发指南](./plugin-development.md)。

### API集成

OpenClaw Cloud提供RESTful API，方便您进行二次开发和集成。

**API文档**: [docs.openclaw-cloud.com/api](https://docs.openclaw-cloud.com/api)

**认证方式**: API Key

**示例**: 

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-openclaw-cloud.com/api/v1/instances
```

### 命令行工具 (CLI)

我们提供CLI工具，方便您在终端中管理OpenClaw Cloud。

**安装**: `npm install -g openclaw-cloud-cli`

**使用**: `openclaw-cloud --help`

**示例**: `openclaw-cloud instances list`

### 贡献代码

我们欢迎任何形式的贡献！请阅读[贡献指南](./CONTRIBUTING.md)。
