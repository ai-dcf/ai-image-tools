import { CropCore } from '@/components/tools/crop/CropCore'

export const metadata = {
  title: '图片裁剪 | Tools',
  description: '在线图片裁剪工具，支持小红书、微信公众号、抖音等多种比例裁剪',
}

export default function CropPage() {
  return (
    <div className="flex-1">
      <CropCore />
    </div>
  )
}
