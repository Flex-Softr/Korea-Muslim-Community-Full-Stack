"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DownloadItem = {
  id: string;
  image: string;
  title: string;
  category: string;
  fileUrl: string;
};

function humanizePath(pathname: string): string {
  const last = pathname.split("/").filter(Boolean).at(-1) ?? "";

  return last
    .split("-")
    .filter(Boolean)
    .map((part) =>
      part.length <= 3
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

export function PageGridContent({ category }: { category?: string }) {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // ✅ FIX: ensure string always

  const pageCategory = useMemo(
    () => category?.trim() || humanizePath(pathname),
    [category, pathname]
  );

  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          category: pageCategory,
        });

        const res = await fetch(
          `/api/public/downloads?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = (await res.json()) as { items?: DownloadItem[] };

        if (!res.ok || cancelled) return;

        setItems(data.items ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [pageCategory]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground md:col-span-3">
          Loading...
        </p>
      ) : null}

      {!loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground md:col-span-3">
          No downloads found.
        </p>
      ) : null}

      {items.map((card) => (
        <div
          key={card.id}
          className="flex flex-col gap-3 border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400"
        >
          <a
            href={card.fileUrl}
            download
            className="flex flex-col justify-between gap-3"
          >
            <div className="w-full">
              <Image
                src={card.image}
                alt={card.title}
                className="h-[200px] w-full object-cover"
                width={320}
                height={200}
              />
            </div>

            <h1 className="cursor-pointer text-xl hover:underline">
              {card.title}
            </h1>
          </a>
        </div>
      ))}
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";

// type DownloadItem = {
//   id: string;
//   image: string;
//   title: string;
//   category: string;
//   fileUrl: string;
// };

// function humanizePath(pathname: string): string {
//   const last = pathname.split("/").filter(Boolean).at(-1) ?? "";
//   return last
//     .split("-")
//     .filter(Boolean)
//     .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
//     .join(" ");
// }

// export function PageGridContent({ category }: { category?: string }) {
//   const pathname = usePathname();
//   const pageCategory = useMemo(
//     () => category?.trim() || humanizePath(pathname),
//     [category, pathname],
//   );
//   const [items, setItems] = useState<DownloadItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams({ category: pageCategory });
//         const res = await fetch(`/api/public/downloads?${params.toString()}`, { cache: "no-store" });
//         const data = (await res.json()) as { items?: DownloadItem[] };
//         if (!res.ok || cancelled) return;
//         setItems(data.items ?? []);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     void load();
//     return () => {
//       cancelled = true;
//     };
//   }, [pageCategory]);

//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//       {loading && items.length === 0 ? (
//         <p className="text-sm text-muted-foreground md:col-span-3">Loading...</p>
//       ) : null}
//       {!loading && items.length === 0 ? (
//         <p className="text-sm text-muted-foreground md:col-span-3">No downloads found.</p>
//       ) : null}
//       {items.map((card) => (
//         <div
//           key={card.id}
//           className="flex flex-col gap-3 border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400"
//         >
//           <a href={card.fileUrl} download className="flex flex-col justify-between gap-3">
//             <div className="w-full">
//               <Image
//                 src={card.image}
//                 alt={card.title}
//                 className="h-[200px] w-full object-cover"
//                 width={320}
//                 height={200}
//               />
//             </div>
//             <h1 className="cursor-pointer text-xl hover:underline">{card.title}</h1>
//           </a>
//         </div>
//       ))}
//     </div>
//   );
// }
