import { CompressorCore } from "@/components/tools/compress/CompressorCore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片压缩 - Image Tool",
  description: "在线压缩图片大小，支持多种预设与自定义设置，快速优化您的图片质量与体积。",
};

export default function CompressPage() {
  return <CompressorCore />;
}
