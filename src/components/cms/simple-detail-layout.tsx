import Image from "next/image";
import Link from "next/link";

export type SimpleDetailItem = {
  id: string;
  href: string;
  title: string;
  image: string;
  description?: string;
};

export function SimpleDetailLayout({
  sidebarTitle,
  item,
  sidebarItems,
}: {
  sidebarTitle: string;
  item: SimpleDetailItem;
  sidebarItems: SimpleDetailItem[];
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-2 py-10 sm:flex-row">
      <aside className="w-full sm:w-1/3">
        <div className="border-1 p-2 shadow-sm shadow-gray-400">
          <h2 className="bg-[#0a1628] p-3 text-lg text-white">{sidebarTitle}</h2>
          <div className="flex flex-col gap-4 bg-[#5bc0de] px-4 py-6">
            {sidebarItems.length === 0 ? (
              <p className="text-base">No other items found.</p>
            ) : (
              sidebarItems.map((sidebarItem) => (
                <Link
                  key={sidebarItem.id}
                  href={sidebarItem.href}
                  className="flex gap-3 text-left hover:underline"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden bg-white/30">
                    <Image
                      src={sidebarItem.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </span>
                  <span className="line-clamp-2 text-lg">{sidebarItem.title}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </aside>

      <article className="w-full border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400 sm:w-2/3">
        <div className="relative mb-5 aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 66vw"
            priority
          />
        </div>
        <h1 className="text-3xl font-semibold">{item.title}</h1>
        <div
          className="prose prose-slate mt-4 max-w-none text-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: item.description || "" }}
        />
      </article>
    </div>
  );
}
