import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const links = [
    { name: '首页', href: '/' },
    { name: '图片压缩', href: '/tools/compress' },
    { name: '图片裁剪', href: '/tools/crop' },
    { name: '添加边框', href: '/tools/border' },
    { name: '添加文字', href: '/tools/text' },
    { name: '拼图制作', href: '/tools/collage' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-100/50">
      <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 bg-black rounded-sm group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-bold tracking-tight text-[15px] text-black">
            图片工具箱
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive ? "text-black" : "text-zinc-500 hover:text-black"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="header-active-tab"
                    className="absolute inset-0 bg-zinc-100 rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
