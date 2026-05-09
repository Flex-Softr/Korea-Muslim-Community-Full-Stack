import Image from "next/image";
import image from "../../../../public/hero/banner2.jpg";

export function PageContent() {
    return (
        <div className="flex flex-col gap-4 ">
            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <h1 className="text-3xl hover:underline cursor-pointer">জামায়াতে ইসলামীর গঠনতন্ত্র</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3 w-full">
                    <Image src={image} alt="Education" className="w-full h-auto" width={100} height={100} />
                    </div>
                    <p className="text-lg line-clamp-4 w-full md:w-2/3">বিসমিল্লাহির রাহমানির রাহীম গঠনতন্ত্রবাংলাদেশ জামায়াতে ইসলামী ভূমিকাযেহেতু মহান আল্লাহ তা’য়ালা ব্যতীত কোন ইলাহ নাই এবং নিখিল বিশ্বের সর্বত্র আল্লাহ তা’য়ালার প্রবর্তিত আইনসমূহ.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <h1 className="text-3xl hover:underline cursor-pointer">বাংলাদেশ জামায়াতে ইসলামীর কথা</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3 w-full">
                    <Image src={"https://jamaat-e-islami.org/article_image/l/62_talk%20bji.jpg"} alt="Education" className="w-full h-auto" width={100} height={100} />
                    </div>
                    <p className="text-lg line-clamp-4 w-full md:w-2/3">বাংলাদেশ জামায়াতে ইসলামী মহান মুক্তিযুদ্ধের মাধ্যমে ১৯৭১ সালে স্বাধীন রাষ্ট্র হিসেবে জন্ম নেয়া বাংলাদেশের স্বাধীনতা, ভূখণ্ডীয় সার্বভৌমত্ব ও ইসলামী মূল্যবোধ ...</p>
                </div>
            </div>


            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <h1 className="text-3xl hover:underline cursor-pointer">সংসদ বিষয়ক সংস্কার</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3 w-full">
                    <Image src={"https://jamaat-e-islami.org/article_image/l/31_parliam.jpg"} alt="Education" className="w-full h-auto" width={100} height={100} />
                    </div>
                    <p className="text-lg line-clamp-4 w-full md:w-2/3">কোন দলীয় বা নির্দলীয় সংসদ সদস্যগণ যাতে পার্লামেন্ট অধিবেশনে অনুপস্থিত থেকে সংসদকে অকার্যকর করতে না পারে সে জন্য সংসদের রুলস .</p>
                </div>
            </div>
        </div>
    )
}