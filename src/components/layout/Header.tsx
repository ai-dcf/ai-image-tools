import Link from 'next/link';

export function Header() {
  const links = [
    { name: 'Home', href: '/' },
    { name: 'Compress', href: '/compress' },
    { name: 'Crop', href: '/crop' },
    { name: 'Border', href: '/border' },
    { name: 'Text', href: '/text' },
    { name: 'Collage', href: '/collage' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex w-full overflow-x-auto">
          <Link href="/" className="mr-6 flex shrink-0 items-center space-x-2">
            <span className="font-bold sm:inline-block">
              Toolbox
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-gray-900 text-gray-600"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
