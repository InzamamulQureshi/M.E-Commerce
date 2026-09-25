import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ArrowRight, Instagram, ArrowUpRight } from "lucide-react";
import { CraftPillarsCarousel } from "@/components/store/CraftPillarsCarousel";

export const revalidate = 60;

export default async function AboutPage() {
  const setting = await db.studioSetting.findUnique({
    where: { id: "default" },
  });

  const title = setting?.aboutTitle?.trim() || "Crafted by Hand.\nFolded with Purpose.";
  const slogan =
    setting?.aboutSlogan?.trim() ||
    "In a world of mass-produced plastic gifts, we believe that creations folded with patience, custom photos, and handwritten sentiments hold the greatest emotional weight.";
  const image =
    setting?.aboutImage?.trim() ||
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=85";
  const storeLocation = setting?.storeLocation || "Bandra West, Mumbai";
  const storeName = setting?.storeName || "M.E-Commerce";
  const instagram = setting?.instagram || "https://instagram.com/mecommerce.official";

  const storyBadge = setting?.aboutStoryBadge?.trim() || "The Atelier";
  const storyHeading = setting?.aboutStoryHeading?.trim() || `Behind ${storeName}`;

  const descriptionParagraphs = setting?.aboutDescription?.trim()
    ? setting.aboutDescription.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [
        `${storeName} was founded in ${storeLocation}, with a singular mission: to restore sincerity to the art of giving. What began as handmade surprise boxes created for loved ones quickly resonated across India with people seeking gifts that feel deeply personal and memorable.`,
        "Every creation is cut, scored, folded, and assembled entirely by hand. We reject automated factory templates in favor of precise bone-folder creases, heavy archival cardstocks, and custom photo printing tailored to each customer.",
        "We finish each package with melted sealing wax, custom calligraphy dedications, and multi-layered surprise reveals so that unboxing feels genuine and unforgettable.",
      ];

  // Modular Craft Principles
  let craftPrinciples: { id: string; badge: string; title: string; description: string }[] = [
    {
      id: "p-1",
      badge: "01 / CUT & FOLD",
      title: "100% Hand-Folded",
      description:
        "No automated stamping. Every crease, accordion fold, and pop-up mechanism is hand-scored by our studio team in Mumbai.",
    },
    {
      id: "p-2",
      badge: "02 / SENTIMENT",
      title: "Photos & Hand Scribed",
      description:
        "We print and affix your submitted photos with archival inks, and handwrite your heartfelt personal dedication notes.",
    },
    {
      id: "p-3",
      badge: "03 / MATERIALS",
      title: "Archival Cardstocks",
      description:
        "Crafted from premium weight papers and ribbons that resist creasing and yellowing, keeping keepsakes intact for years.",
    },
    {
      id: "p-4",
      badge: "04 / PACKAGING",
      title: "Insured Transit",
      description:
        "Double-boxed with corner protectors and cushioning, ensuring every delicate fold arrives in pristine gallery condition.",
    },
  ];

  if (setting?.craftPrinciples) {
    try {
      const parsed = JSON.parse(setting.craftPrinciples);
      if (Array.isArray(parsed) && parsed.length > 0) {
        craftPrinciples = parsed;
      }
    } catch (e) {
      console.error("Failed to parse about craft principles:", e);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A64732] dark:bg-[#E07A5F]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#786F64] dark:text-[#A89F91]">
            Our Story • {storeLocation}
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] leading-[1.1] whitespace-pre-line">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-[#575048] dark:text-[#B5ACA1] leading-relaxed max-w-xl mx-auto pt-2">
          {slogan}
        </p>
      </div>

      {/* Story Narrative & Visual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="md:col-span-6">
          <div className="relative aspect-[4/5] bg-[#F2EDE4] dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] p-3 shadow-xs rounded-2xl overflow-hidden">
            <div className="relative w-full h-full overflow-hidden rounded-xl">
              <Image
                src={image}
                alt={`Handcrafting process at ${storeName}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-6 space-y-6 text-sm text-[#575048] dark:text-[#C5BCAD] leading-relaxed">
          <div className="border-b border-[#E7E0D5] dark:border-[#2E2925] pb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold">
              {storyBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1 whitespace-pre-line">
              {storyHeading}
            </h2>
          </div>

          {descriptionParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors rounded-full"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram Atelier</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>

            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#DDD5C7] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold uppercase tracking-widest transition-colors rounded-full"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Studio Values with Failsafe Left/Right Carousel */}
      <div className="border-t border-[#E7E0D5] dark:border-[#2E2925] pt-14">
        <CraftPillarsCarousel
          pillars={craftPrinciples}
          badge={setting?.principlesBadge || "Craft Principles"}
          heading={setting?.principlesHeading || "What Makes Every Gift Special"}
          subheading={setting?.principlesSubheading || "Quality Standards"}
        />
      </div>
    </div>
  );
}
