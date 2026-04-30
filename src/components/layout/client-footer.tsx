import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { FooterScrollTop } from "@/components/layout/footer-scroll-top";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { cn } from "@/lib/utils";

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function ClientFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0a1628] text-white">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -32deg,
            transparent,
            transparent 12px,
            rgba(255, 255, 255, 0.025) 12px,
            rgba(255, 255, 255, 0.025) 13px
          )`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2">
          
          {/* LEFT SIDE */}
          <div className="md:pr-8 lg:pr-12">
            {/* Logo */}
            <div className="flex items-start gap-3">
              <SiteLogoMark />
              <div>
                <p className="text-xl font-bold">
                  Korea Muslim Community
                </p>
                <p className="text-md text-white/80">
                  한국 무슬림 커뮤니티 · Community for Muslims in Korea
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mt-5 text-md text-white/70 max-w-md">
              Connecting Muslims across Korea through events, education,
              spiritual support, and mutual aid — open to everyone.
            </p>

            {/* Social */}
            <div className="mt-6 flex flex-wrap gap-2">
               <SocialLink
                href="https://facebook.com"
                label="Facebook"
                className="bg-[#1877f2] hover:bg-[#166fe5]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://telegram.org"
                label="Telegram"
                className="bg-[#2aabee] hover:bg-[#229ed9]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://x.com"
                label="X (Twitter)"
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8]"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://youtube.com"
                label="YouTube"
                className="bg-[#ff0000] hover:bg-[#e60000]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
            </div>

            {/* CONTACT (moved here) */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Contact</h3>
              <ul className="mt-4 space-y-3 text-md">
                <li>
                  <Link
                    href="/contact"
                    className="flex gap-3 text-white/70 hover:text-white"
                  >
                    <Mail className="size-4 text-sky-400" />
                    Email / contact form
                  </Link>
                </li>

                <li className="flex gap-3 text-white/70">
                  <MapPin className="size-4 text-sky-400" />
                  Republic of Korea
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="flex gap-3 text-white/70 hover:text-white"
                  >
                    <MessageCircle className="size-4 text-sky-400" />
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE (LINK GROUPS) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 md:gap-x-20 gap-y-8">
            
            {/* পরিচিতি */}
            <div>
              <h4 className="text-sky-400 font-semibold text-lg">পরিচিতি</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70">
                <li><Link href="https://shibir.org.bd/en/at-a-glance" className="hover:text-white">এক নজরে</Link></li>
                <li><Link href="https://shibir.org.bd/history" className="hover:text-white">গৌরবোজ্জ্বল ইতিহাস</Link></li>
                <li><Link href="https://shibir.org.bd/sangeet" className="hover:text-white">শিবির সংগীত</Link></li>
                <li><Link href="https://shibir.org.bd/celebrations" className="hover:text-white">দিবসসমূহ</Link></li>
              </ul>

               {/* সংগঠন */}
             <div className="mt-10">
              <h4 className="text-sky-400 font-semibold text-lg">সংগঠন</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70">
                <li><Link href="https://shibir.org.bd/constitution" className="hover:text-white">সংবিধান</Link></li>
                <li><Link href="https://shibir.org.bd/strategy" className="hover:text-white">কর্মপদ্ধতি</Link></li>
                <li><Link href="https://shibir.org.bd/central-committee" className="hover:text-white">কার্যকরী পরিষদ</Link></li>
                <li><Link href="https://shibir.org.bd/branches" className="hover:text-white">শাখাসমূহ</Link></li>
                <li><Link href="https://shibir.org.bd/departments" className="hover:text-white">বিভাগসমূহ</Link></li>
              </ul>
            </div>

            {/* নেতৃত্ব */}
            <div className="mt-8">
              <h4 className="text-sky-400 font-semibold text-lg">নেতৃত্ব</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70">
                <li>
                  <Link href="https://jamaat-e-islami.org/leadership.php?leader=1" className="hover:text-white">
                    আমীরে জামায়াত
                  </Link>
                </li>
              </ul>
            </div>
            </div>

             {/* ঐতিহাসিক ক্ষণ */}
             <div>
              <h4 className="text-sky-400 font-semibold text-lg">ঐতিহাসিক ক্ষণ</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70">
                <li><Link href="https://shibir.org.bd/chronicles/sultanate-e-bangalah" className="hover:text-white">সালতানাত-ই-বাঙ্গালাহ</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/baro-bhuyans" className="hover:text-white">বারো ভূঁইয়া</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/subah-bangalah" className="hover:text-white">সুবাহ বাঙ্গালাহ</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/azadi-movement" className="hover:text-white">আজাদী আন্দোলন</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/pakistan-movement" className="hover:text-white">পাকিস্তান আন্দোলন</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/seventy-one" className="hover:text-white">একাত্তর</Link></li>
                <li><Link href="https://shibir.org.bd/chronicles/july-revolution" className="hover:text-white">জুলাই বিপ্লব</Link></li>
              </ul>

              {/* আপডেট */}
            <div className="mt-10">
              <h4 className="text-sky-400 font-semibold text-lg">আপডেট</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70">
                <li><Link href="https://shibir.org.bd/press-release" className="hover:text-white">সংবাদ বিজ্ঞপ্তি</Link></li>
                <li><Link href="https://shibir.org.bd/news" className="hover:text-white">সংবাদ</Link></li>
                <li><Link href="https://shibir.org.bd/events" className="hover:text-white">ইভেন্টসমূহ</Link></li>
              </ul>
            </div>
          
         
            </div>

            {/* কার্যক্রম */}
            <div>
              <h4 className="text-sky-400 font-semibold text-lg">কার্যক্রম</h4>
              <ul className="mt-3 space-y-1.5 text-md text-white/70 font-100">
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=77" className="hover:text-white">দাওয়াতী কার্যক্রম</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=78" className="hover:text-white">সমাজ কল্যাণমূলক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=79" className="hover:text-white">তারবিয়াত</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=80" className="hover:text-white">রাজনৈতিক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=81" className="hover:text-white">শিক্ষা</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=82" className="hover:text-white">স্বাস্থ্য সেবা মূলক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=83" className="hover:text-white">শ্রমিক কল্যাণমূলক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=84" className="hover:text-white">সাংস্কৃতিক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=85" className="hover:text-white">কৃষি উন্নয়নমূলক</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=86" className="hover:text-white">যুব ও ক্রীড়া</Link></li>
                <li><Link href="https://jamaat-e-islami.org/category.php?cid=91" className="hover:text-white">আন্তর্জাতিক</Link></li>
              </ul>
            </div>

       
 
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/60">
        <p>
          © {new Date().getFullYear()} <span className="pl-[2px]">Korea Muslim Community. All rights reserved.</span>
        </p>

        <p className="mt-3">
          Developed by{" "}
          <a
            href="https://www.flexsoftr.com"
            target="_blank"
            className="text-sky-400 hover:underline"
          >
            FlexSoftr
          </a>
        </p>
      </div>

      <FooterScrollTop />
    </footer>
  );
}

// import Link from "next/link";
// import { Mail, MapPin, MessageCircle } from "lucide-react";
// import { FooterScrollTop } from "@/components/layout/footer-scroll-top";
// import { SiteLogoMark } from "@/components/layout/site-logo-mark";
// import { cn } from "@/lib/utils";

// function SocialLink({
//   href,
//   label,
//   className,
//   children,
// }: {
//   href: string;
//   label: string;
//   className?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <a
//       href={href}
//       target="_blank"
//       rel="noopener noreferrer"
//       aria-label={label}
//       className={cn(
//         "inline-flex size-10 items-center justify-center rounded-md transition-colors",
//         className,
//       )}
//     >
//       {children}
//     </a>
//   );
// }

// export function ClientFooter() {
//   return (
//     <footer className="relative mt-auto overflow-hidden bg-[#0a1628] text-white">
//       {/* Subtle diagonal texture */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.45]"
//         style={{
//           backgroundImage: `repeating-linear-gradient(
//             -32deg,
//             transparent,
//             transparent 12px,
//             rgba(255, 255, 255, 0.025) 12px,
//             rgba(255, 255, 255, 0.025) 13px
//           )`,
//         }}
//         aria-hidden
//       />

//       <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
//         <div className="grid gap-10 md:grid-cols-3 md:gap-0">
//           {/* Column 1 — identity */}
//           <div className="md:border-r md:border-white/10 md:pr-8 lg:pr-12">
//             <div className="flex items-start gap-3 sm:gap-4">
//               <SiteLogoMark />
//               <div className="min-w-0 pt-0.5">
//                 <p className="text-base font-bold leading-tight sm:text-lg">
//                   Korea Muslim Community
//                 </p>
//                 <p className="mt-1 text-sm font-medium text-white/85">
//                   한국 무슬림 커뮤니티 · Community for Muslims in Korea
//                 </p>
//               </div>
//             </div>
//             <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
//               Connecting Muslims across Korea through events, education,
//               spiritual support, and mutual aid — open to everyone who shares our
//               values of dignity, service, and unity.
//             </p>
//             <div className="mt-6 flex flex-wrap gap-2">
//               <SocialLink
//                 href="https://facebook.com"
//                 label="Facebook"
//                 className="bg-[#1877f2] hover:bg-[#166fe5]"
//               >
//                 <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                 </svg>
//               </SocialLink>
//               <SocialLink
//                 href="https://telegram.org"
//                 label="Telegram"
//                 className="bg-[#2aabee] hover:bg-[#229ed9]"
//               >
//                 <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
//                 </svg>
//               </SocialLink>
//               <SocialLink
//                 href="https://x.com"
//                 label="X (Twitter)"
//                 className="bg-[#1d9bf0] hover:bg-[#1a8cd8]"
//               >
//                 <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
//                 </svg>
//               </SocialLink>
//               <SocialLink
//                 href="https://youtube.com"
//                 label="YouTube"
//                 className="bg-[#ff0000] hover:bg-[#e60000]"
//               >
//                 <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
//                 </svg>
//               </SocialLink>
//             </div>
//           </div>

//           {/* Column 2 — links */}
//           <div className="md:border-r md:border-white/10 md:px-8 lg:px-12">
//             <h3 className="text-base font-semibold tracking-wide text-white">
//               Quick links
//             </h3>
//             <ul className="mt-4 space-y-3 text-sm">
//               <li>
//                 <Link
//                   href="/"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Home
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/about"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   About
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/blog"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Blog
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/gallery"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Gallery
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/activity"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Activity
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/videos"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Videos
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/donation"
//                   className="text-white/75 transition-colors hover:text-white"
//                 >
//                   Donation
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Column 3 — contact */}
//           <div className="md:pl-8 lg:pl-12">
//             <h3 className="text-base font-semibold tracking-wide text-white">
//               Contact
//             </h3>
//             <ul className="mt-4 space-y-4 text-sm">
//               <li>
//                 <Link
//                   href="/contact"
//                   className="flex items-start gap-3 text-white/75 transition-colors hover:text-white"
//                 >
//                   <Mail className="mt-0.5 size-4 shrink-0 text-sky-400" />
//                   <span>Email / contact form</span>
//                 </Link>
//               </li>
//               <li className="flex items-start gap-3 text-white/75">
//                 <MapPin className="mt-0.5 size-4 shrink-0 text-sky-400" />
//                 <span>
//                   Serving the Muslim community across the Republic of Korea
//                 </span>
//               </li>
//               <li>
//                 <Link
//                   href="/contact"
//                   className="flex items-start gap-3 text-white/75 transition-colors hover:text-white"
//                 >
//                   <MessageCircle className="mt-0.5 size-4 shrink-0 text-sky-400" />
//                   <span>Contact us</span>
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       <div className="relative border-t border-white/10 px-4 py-6 text-center text-xs text-white/70 sm:text-sm">
//         <p>
//           © {new Date().getFullYear()} Korea Muslim Community. All rights
//           reserved.
//         </p>
       
//         <p className="mt-4 text-white/55">
//           Developed by{" "}
//           <a
//             href="https://www.flexsoftr.com"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="font-medium text-sky-400/90 underline-offset-4 transition-colors hover:text-sky-300 hover:underline"
//           >
//             FlexSoftr
//           </a>
//         </p>
     
//       </div>

//       <FooterScrollTop />
//     </footer>
//   );
// }
