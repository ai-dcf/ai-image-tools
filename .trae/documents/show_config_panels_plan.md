# 图片工具箱体验优化计划 (显示所有属性配置)

## 摘要 (Summary)
用户反馈在“图片裁剪”和“添加边框”工具中未看到属性配置功能。经排查，这些功能已经完全开发完毕，但由于当前的条件渲染逻辑（`if (imageSrc)` 或 `if (originalImage)`），它们在用户上传图片前被完全隐藏了。
根据用户的选择，本计划旨在将所有核心工具（裁剪、边框、文字、拼图、压缩）的右侧配置面板调整为**“始终显示，未上传图片时置灰/禁用”**的交互模式，以便用户提前了解可用功能。

## 当前状态分析 (Current State Analysis)
- **CropCore (裁剪)**: 必须上传图片后，比例、缩放、旋转、翻转、输出尺寸等面板才会渲染。
- **BorderCore (边框)**: 必须上传图片后，预设风格、边距设置、圆角、背景颜色等面板才会渲染。
- **CompressorCore (压缩)**: 必须上传图片后，压缩质量、输出格式等配置面板才会渲染。
- **TextCore (文字)**: 预设按钮已存在但通过 `disabled` 禁用。文字设置面板仅在选中文字时显示（合理逻辑）。导出按钮在无图时隐藏。
- **CollageCore (拼图)**: 模板和配置项（间距、圆角等）始终显示且可交互。拖拽列表和导出按钮在无图时隐藏。

## 拟定变更 (Proposed Changes)

### 任务 1：优化图片裁剪工具 (Crop)
- **文件**: `src/components/tools/crop/CropCore.tsx`
- **变更内容**:
  - 移除包裹所有配置项的 `{imageSrc && ( ... )}` 条件渲染。
  - 为所有按钮（如预设按钮、旋转按钮、翻转按钮）添加 `disabled={!imageSrc}` 属性。
  - 为所有 Slider 组件和 Input 组件添加 `disabled={!imageSrc}` 属性（或通过包裹一层设置 `opacity-50 pointer-events-none` 的 div 来实现视觉置灰）。
  - 将导出按钮的条件从隐藏改为 `disabled={!imageSrc}`。

### 任务 2：优化添加边框工具 (Border)
- **文件**: `src/components/tools/border/BorderCore.tsx`
- **变更内容**:
  - 移除包裹配置项的 `{originalImage && ( ... )}` 条件渲染。
  - 将整个配置面板（除“上传图片”按钮外）使用一个包装 div 包裹，并根据 `originalImage` 的存在与否动态应用 `opacity-50 pointer-events-none` 类名，实现全局置灰和禁用交互。
  - 或者逐个为 Button, Slider, Input 添加 `disabled={!originalImage}`。
  - 导出按钮保持显示但设为禁用。

### 任务 3：优化图片压缩工具 (Compress)
- **文件**: `src/components/tools/compress/CompressorCore.tsx`
- **变更内容**:
  - 移除 `config` 变量中预设方案和通用配置区域外部的条件渲染（如果存在）。
  - 确保“压缩质量”和“输出格式”在无图片时可见，但将其包裹在禁用状态的 UI 中（如 `opacity-50 pointer-events-none`）。

### 任务 4：统一其余工具的导出按钮
- **文件**: `src/components/tools/text/TextCore.tsx`, `src/components/tools/collage/CollageCore.tsx`
- **变更内容**:
  - **TextCore**: 将包裹“导出图片”按钮的 `{originalImage && ( ... )}` 移除，直接渲染按钮并添加 `disabled={!originalImage}`。
  - **CollageCore**: 将包裹“导出拼图”和“清空全部”的 `{images.length > 0 && ( ... )}` 移除，直接渲染并为这两个按钮添加 `disabled={images.length === 0}`。

## 假设与决策 (Assumptions & Decisions)
- **交互一致性**: 采用“始终显示但置灰不可用”的设计模式能降低用户的认知门槛，让他们在上传图片前就能看到该工具提供的所有能力（如裁剪比例有哪些、边框能调什么参数）。
- **置灰实现方式**: 对于大量混合了原生 input、Slider 和自定义 UI 的复杂面板，使用外层包裹 `className={!imageSrc ? "opacity-50 pointer-events-none select-none transition-opacity" : "transition-opacity"}` 是最干净且不易漏掉状态的实现方式。

## 验证步骤 (Verification Steps)
1. 刷新页面并分别进入“压缩”、“裁剪”、“边框”、“文字”、“拼图”五个工具的路由。
2. 在**不上传任何图片**的情况下，观察右侧的配置面板。
3. 确认所有的预设选项、滑块、颜色选择器、宽高输入框均**可见但呈半透明置灰状态**，且鼠标点击/拖拽无效。
4. 确认底部的“导出/下载”按钮可见但处于 `disabled` 状态。
5. 上传一张测试图片，确认配置面板瞬间解除置灰状态并恢复正常的交互功能。