import Image from "next/image";
import image from "../../../../public/hero/banner2.jpg";
import Link from "next/link";

export function PageGridContent() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <Link href="/article/1">
                <div className="flex flex-col justify-between gap-3">
                    <div className=" w-full">
                    <Image src={image} alt="Education" className="w-full h-[200px] object-cover" width={100} height={100} />
                    </div>
                    <h1 className="text-xl hover:underline cursor-pointer">জামায়াতে ইসলামীর গঠনতন্ত্র</h1>
                </div>
                </Link>
                 </div>

            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <Link href="/article/2">
                <div className="flex flex-col gap-3">
                    <div className=" w-full">
                    <Image src={"https://jamaat-e-islami.org/article_image/l/62_talk%20bji.jpg"} alt="Education" className="w-full h-[200px] object-cover" width={100} height={100} />
                    </div>
                    <h1 className="text-xl hover:underline cursor-pointer">বাংলাদেশ জামায়াতে ইসলামীর কথা</h1>
                </div>
                </Link>
            </div>


            <div className="flex flex-col gap-3 px-3 py-4 border-b-4 border-[#5bc0de] shadow-sm shadow-gray-400">
                <Link href="/article/3">
                <div className="flex flex-col gap-3">
                    <div className=" w-full">
                    <Image src={"https://jamaat-e-islami.org/article_image/l/31_parliam.jpg"} alt="Education" className="w-full h-[200px] object-cover" width={100} height={100} />
                    </div>
                    <h1 className="text-xl hover:underline cursor-pointer">সংসদ বিষয়ক সংস্কার</h1>
                </div>
                </Link>
            </div>
        </div>
    )
}