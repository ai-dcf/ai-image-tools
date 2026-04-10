"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Minimize2, Crop, Square, Type, LayoutGrid } from "lucide-react";

const tools = [
  {
    name: "图片压缩",
    description: "极致压缩比，保持画质无损。支持 WebP、JPG 等多格式导出。",
    href: "/tools/compress",
    icon: Minimize2,
  },
  {
    name: "图片裁剪",
    description: "自由比例控制，提供小红书、微信等全平台主流预设。",
    href: "/tools/crop",
    icon: Crop,
  },
  {
    name: "添加边框",
    description: "拍立得、极简细线、电影感。用留白为图片赋予高级质感。",
    href: "/tools/border",
    icon: Square,
  },
  {
    name: "添加文字",
    description: "自定义排版、阴影、背景色块。快速制作金句海报与水印。",
    href: "/tools/text",
    icon: Type,
  },
  {
    name: "拼图制作",
    description: "九宫格、对比图、留白排版。支持自由拖拽与极简样式控制。",
    href: "/tools/collage",
    icon: LayoutGrid,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-32">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h1 className="text-[3.5rem] leading-[1.1] tracking-tighter text-black sm:text-[5rem] font-bold">
            纯净、私密、极速。<br />
            <span className="text-zinc-400">您的本地图片处理工作流。</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-zinc-600 leading-relaxed font-medium">
            无需上传服务器。基于纯前端技术构建的高级图片工具箱，
            为您提供所见即所得的极简处理体验。
          </p>
        </motion.div>

        {/* Tools List Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-32 border-t border-zinc-200"
        >
          {tools.map((tool, idx) => (
            <motion.div key={tool.href} variants={itemVariants}>
              <Link
                href={tool.href}
                className="group flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 py-10 transition-colors hover:bg-zinc-50"
              >
                <div className="flex items-start gap-8 sm:w-2/3">
                  <div className="text-sm font-mono text-zinc-400 pt-1 shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-black group-hover:translate-x-2 transition-transform duration-300">
                      {tool.name}
                    </h2>
                    <p className="mt-4 text-zinc-500 text-base max-w-md group-hover:text-zinc-900 transition-colors">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 sm:mt-0 sm:w-1/3 flex justify-end">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-32 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-400 font-mono"
        >
          <p>100% 本地处理 · 无隐私泄露风险</p>
          <p>IMAGE TOOLS © {new Date().getFullYear()}</p>
        </motion.div>
      </div>
    </div>
  );
}
