import image from "../../../../public/hero/banner2.jpg";
import Image from "next/image";

export function PageSidebar() {
    return (
        <div className="p-2 shadow-sm border-1 shadow-gray-400">
            <section >
                <h2 className="text-lg p-3 bg-[#0a1628] text-white ">জনমত জরিপ</h2>
                <div className="p-3 bg-[#5bc0de]">
                    <p className="pb-4 text-xl">কম সংস্কার চাইলে ডিসেম্বরে, অন্যথায় জুনের মধ্যে নির্বাচন : প্রধান উপদেষ্টার এই বক্তব্যকে কি সমর্থন করেন?</p>
                    <div className="flex gap-2 pb-1">
                    <input type="radio" name="সন্দেহাতীত ভাবে হ্যাঁ" id="vote1" />
                    <label className="text-lg" htmlFor="vote1">সন্দেহাতীত ভাবে হ্যাঁ</label>
                    </div>
                    <div className="flex gap-2 pb-1">
                    <input type="radio" name=" হ্যাঁ" id="vote1" />
                    <label className="text-lg" htmlFor="vote1"> হ্যাঁ</label>
                    </div>
                    <div className="flex gap-2 pb-1">
                    <input type="radio" name=" না" id="vote1" />
                    <label className="text-lg" htmlFor="vote1"> না</label>
                    </div>
                    <div className="flex gap-2 pb-1">
                    <input type="radio" name="বিন্দুমাত্র না" id="vote1" />
                    <label className="text-lg" htmlFor="vote1"> বিন্দুমাত্র না</label>
                    </div>
                    <div className="flex gap-2 pt-4">
                    <button className="bg-blue-500 text-white p-2 rounded-sm">ভোট দিন</button>
                    <button className="bg-[#0a1628] text-white p-2 rounded-sm">Result</button>
                    </div>
                </div>
            </section>

            <section className="rounded-sm mt-4">
                <h2 className="text-lg p-3 bg-[#0a1628] text-white ">উল্লেখযোগ্য নিবন্ধ</h2>
                <div className="px-4 py-6 bg-[#5bc0de] space-y-4 flex flex-col gap-2">
                   <a href="#" className="text-xl hover:underline ">হিংসা-বিদ্বেষ, হানাহানি ভুলে ঐক্যবদ্ধ হই- ডা. শফিকুর রহমান</a>
                   <a href="#" className="text-xl hover:underline">রক্তাক্ত ২৮ অক্টোবর :বাংলাদেশের রাজনৈতিক ইতিহাসের শ্রেষ্ঠ মানবতাবিরোধী অপরাধ</a>
                   <a href="#" className="text-xl hover:underline">সাবেক আমীরে জামায়াত শহীদ মাওলানা মতিউর রহমান নিজামী গ্রেফতার হওয়ার পূর্বে জাতির উদ্দেশে ঐতিহাসিক বক্তব্য</a>
                   <a href="#" className="text-xl hover:underline">জাতির উদ্দেশে অধ্যাপক গোলাম আযমের দেয়া বক্তব্য</a>
                   <a href="#" className="text-xl hover:underline">২০০৬ সালের ২৮ অক্টোবর আওয়ামী সন্ত্রাসীদের নৃশংস তান্ডব</a>

                    
                </div>
            </section>

            <section className="rounded-sm mt-4">
                <h2 className="text-lg p-3 bg-[#0a1628] text-white ">উল্লেখযোগ্য সংবাদ</h2>
                <div className="px-4 py-6 bg-[#5bc0de] space-y-4 flex flex-col gap-2">
                   <a href="#" className="text-xl hover:underline ">ফ্যাসিস্ট সরকার কর্তৃক মামলা-হামলা, জুলুম-নির্যাতন ও গ্রেফতার অভিযানের তীব্র নিন্দা ও প্রতিবাদ</a>
                   <a href="#" className="text-xl hover:underline">বাংলাদেশ ও ভারতের মধ্যে বিরাজমান বিভিন্ন সমস্যা সমাধানের ব্যাপারে গুরুত্বপূর্ণ ভূমিকা পালন করার আশাবাদ</a>
                   <a href="#" className="text-xl hover:underline">সাবেক আমীরে জামায়াত শহীদ মাওলানা মতিউর রহমান নিজামী গ্রেফতার হওয়ার পূর্বে জাতির উদ্দেশে ঐতিহাসিক বক্তব্য</a>
                   <a href="#" className="text-xl hover:underline">পবিত্র আশুরার দিনটি সারা বিশ্বের মুলমানদের কাছে বিশেষভাবে গুরুত্বপূর্ণ ও তাৎপর্যময়</a>
                  

                    
                </div>
            </section>

            <section className="rounded-sm mt-4">
                <h2 className="text-lg p-3 bg-[#0a1628] text-white ">উল্লেখযোগ্য ভিডিও</h2>
                <div className="px-4 py-6 bg-[#5bc0de] space-y-4 flex flex-col gap-2">
                  <Image src={image} alt="video" className="w-full h-auto" />
                  

                    
                </div>
            </section>

            <section className="rounded-sm mt-4">
                <h2 className="text-lg p-3 bg-[#0a1628] text-white ">উল্লেখযোগ্য ছবি</h2>
                <div className="px-4 py-6 bg-[#5bc0de] space-y-4 flex flex-col gap-2">
                  <Image src={image} alt="video" className="w-full h-auto" />
                  

                    
                </div>
            </section>

        </div>
    )
}