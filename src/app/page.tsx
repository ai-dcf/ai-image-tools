import Link from "next/link";
import { 
  Minimize2, 
  Crop, 
  Square, 
  Type, 
  LayoutGrid,
  ArrowRight
} from "lucide-react";

const tools = [
  {
    name: "图片压缩",
    description: "减小图片文件大小，同时保持高质量。",
    href: "/tools/compress",
    icon: Minimize2,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    name: "图片裁剪",
    description: "裁剪图片到完美尺寸，支持多种比例。",
    href: "/tools/crop",
    icon: Crop,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    name: "添加边框",
    description: "为您的图片添加自定义边框和装饰。",
    href: "/tools/border",
    icon: Square,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    name: "添加文字",
    description: "在图片上添加个性化文字和排版。",
    href: "/tools/text",
    icon: Type,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    name: "拼图制作",
    description: "将多张图片组合成精美的拼图。",
    href: "/tools/collage",
    icon: LayoutGrid,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="px-6 pt-24 pb-16 text-center lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            简单而强大的<span className="text-blue-600">在线图片工具</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            无需下载安装，在浏览器中即可完成图片的压缩、裁剪、边框添加等操作。快速、安全且完全免费。
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-none"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${tool.bgColor} transition-colors group-hover:scale-110`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {tool.name}
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-8 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  立即使用
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Features */}
      <section className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">100% 隐私</div>
              <p className="mt-2 text-sm text-zinc-500">所有处理都在本地完成，您的图片永不上传服务器。</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">极速处理</div>
              <p className="mt-2 text-sm text-zinc-500">基于现代浏览器技术，即刻获得处理结果。</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">完全免费</div>
              <p className="mt-2 text-sm text-zinc-500">所有功能均可免费使用，无水印，无限制。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
