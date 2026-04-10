import { ToolLayout } from "@/components/layout/ToolLayout";

export default function TextPage() {
  const preview = (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">功能开发中...</h2>
        <p className="text-gray-500">添加文字功能正在努力开发中，敬请期待！</p>
      </div>
    </div>
  );

  const config = (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-medium text-gray-900 mb-2">功能开发中...</h2>
      <p className="text-gray-500">相关配置项将在这里显示</p>
    </div>
  );

  return <ToolLayout preview={preview} config={config} />;
}