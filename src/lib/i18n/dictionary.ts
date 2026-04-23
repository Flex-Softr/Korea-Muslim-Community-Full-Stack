export type Lang = "en" | "bn" | "kr";

export type TranslationKey =
  | "common.login"
  | "common.home"
  | "common.blog"
  | "common.activity"
  | "common.about"
  | "common.media"
  | "common.members"
  | "common.photoGallery"
  | "common.videoGallery"
  | "common.donation"
  | "common.readMore"
  | "common.readArticle"
  | "common.backToSite"
  | "common.settings"
  | "common.logout"
  | "common.language"
  | "common.bengali"
  | "common.english"
  | "common.korean"
  | "common.languageChanged"
  | "blog.noPostsYet"
  | "blog.noPostsMatch"
  | "blog.showAll"
  | "blog.showing"
  | "blog.of"
  | "blog.post"
  | "blog.posts"
  | "blog.withActiveFilters"
  | "blog.in"
  | "blog.for"
  | "blog.filterByYear"
  | "blog.allYears"
  | "blog.clearYear"
  | "activity.noStoriesYet"
  | "activity.noStoriesMatch"
  | "activity.story"
  | "activity.stories"
  | "activity.viewAll"
  | "activity.continueReading";

type Dictionary = Record<Lang, Record<TranslationKey, string>>;

export const dictionary: Dictionary = {
  en: {
    "common.login": "Login",
    "common.home": "Home",
    "common.blog": "Blog",
    "common.activity": "Activity",
    "common.about": "About",
    "common.media": "Media",
    "common.members": "Members",
    "common.photoGallery": "Photo Gallery",
    "common.videoGallery": "Video Gallery",
    "common.donation": "Donation",
    "common.readMore": "Read more",
    "common.readArticle": "Read article",
    "common.backToSite": "Back to site",
    "common.settings": "Settings",
    "common.logout": "Log out",
    "common.language": "Language",
    "common.bengali": "Bengali",
    "common.english": "English",
    "common.korean": "Korean",
    "common.languageChanged": "Language changed successfully.",
    "blog.noPostsYet": "No posts yet.",
    "blog.noPostsMatch": "No posts match your filters. Try another filter or",
    "blog.showAll": "show all",
    "blog.showing": "Showing",
    "blog.of": "of",
    "blog.post": "post",
    "blog.posts": "posts",
    "blog.withActiveFilters": "with active filters",
    "blog.in": "in",
    "blog.for": "for",
    "blog.filterByYear": "Filter by year",
    "blog.allYears": "All years",
    "blog.clearYear": "Clear year",
    "activity.noStoriesYet": "No stories yet.",
    "activity.noStoriesMatch": "No stories match your filters. Try another filter or",
    "activity.story": "story",
    "activity.stories": "stories",
    "activity.viewAll": "View all activity",
    "activity.continueReading": "Continue reading",
  },
  bn: {
    "common.login": "লগইন",
    "common.home": "হোম",
    "common.blog": "ব্লগ",
    "common.activity": "অ্যাক্টিভিটি",
    "common.about": "পরিচিতি",
    "common.media": "মিডিয়া",
    "common.members": "সদস্য",
    "common.photoGallery": "ফটো গ্যালারি",
    "common.videoGallery": "ভিডিও গ্যালারি",
    "common.donation": "ডোনেশন",
    "common.readMore": "আরও পড়ুন",
    "common.readArticle": "আর্টিকেল পড়ুন",
    "common.backToSite": "সাইটে ফিরে যান",
    "common.settings": "সেটিংস",
    "common.logout": "লগ আউট",
    "common.language": "ভাষা",
    "common.bengali": "বাংলা",
    "common.english": "ইংরেজি",
    "common.korean": "কোরিয়ান",
    "common.languageChanged": "ভাষা সফলভাবে পরিবর্তন হয়েছে।",
    "blog.noPostsYet": "এখনও কোনো পোস্ট নেই।",
    "blog.noPostsMatch": "ফিল্টারের সাথে কোনো পোস্ট মেলেনি। অন্য ফিল্টার চেষ্টা করুন বা",
    "blog.showAll": "সব দেখুন",
    "blog.showing": "দেখানো হচ্ছে",
    "blog.of": "মোট",
    "blog.post": "পোস্ট",
    "blog.posts": "পোস্ট",
    "blog.withActiveFilters": "সক্রিয় ফিল্টারসহ",
    "blog.in": "বিভাগ",
    "blog.for": "বছর",
    "blog.filterByYear": "বছর দিয়ে ফিল্টার করুন",
    "blog.allYears": "সব বছর",
    "blog.clearYear": "বছর মুছুন",
    "activity.noStoriesYet": "এখনও কোনো আপডেট নেই।",
    "activity.noStoriesMatch": "ফিল্টারের সাথে কোনো আপডেট মেলেনি। অন্য ফিল্টার চেষ্টা করুন বা",
    "activity.story": "স্টোরি",
    "activity.stories": "স্টোরি",
    "activity.viewAll": "সব কার্যক্রম দেখুন",
    "activity.continueReading": "পড়া চালিয়ে যান",
  },
  kr: {
    "common.login": "로그인",
    "common.home": "홈",
    "common.blog": "블로그",
    "common.activity": "활동",
    "common.about": "소개",
    "common.media": "미디어",
    "common.members": "회원",
    "common.photoGallery": "사진 갤러리",
    "common.videoGallery": "비디오 갤러리",
    "common.donation": "후원",
    "common.readMore": "더 보기",
    "common.readArticle": "기사 읽기",
    "common.backToSite": "사이트로 돌아가기",
    "common.settings": "설정",
    "common.logout": "로그아웃",
    "common.language": "언어",
    "common.bengali": "벵골어",
    "common.english": "영어",
    "common.korean": "한국어",
    "common.languageChanged": "언어가 변경되었습니다.",
    "blog.noPostsYet": "게시물이 아직 없습니다.",
    "blog.noPostsMatch": "필터와 일치하는 게시물이 없습니다. 다른 필터를 사용하거나",
    "blog.showAll": "전체 보기",
    "blog.showing": "표시",
    "blog.of": "총",
    "blog.post": "게시물",
    "blog.posts": "게시물",
    "blog.withActiveFilters": "활성 필터 적용됨",
    "blog.in": "카테고리",
    "blog.for": "연도",
    "blog.filterByYear": "연도별 필터",
    "blog.allYears": "전체 연도",
    "blog.clearYear": "연도 초기화",
    "activity.noStoriesYet": "아직 소식이 없습니다.",
    "activity.noStoriesMatch": "필터와 일치하는 소식이 없습니다. 다른 필터를 사용하거나",
    "activity.story": "소식",
    "activity.stories": "소식",
    "activity.viewAll": "모든 활동 보기",
    "activity.continueReading": "계속 읽기",
  },
};
