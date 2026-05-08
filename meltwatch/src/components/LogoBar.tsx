import { useLanguage } from "@/contexts/LanguageContext";

type LogoItem = { src: string; alt: string };

const LOGOS: LogoItem[] = [
  { src: "/logos/tencent.png", alt: "Tencent" },
  { src: "/logos/bytedance.png", alt: "ByteDance" },
  { src: "/logos/meituan.png", alt: "Meituan" },
  { src: "/logos/microsoft.png", alt: "Microsoft" },
  { src: "/logos/google.png", alt: "Google" },
];

export function LogoBar() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-ink/[0.08] py-16 bg-cream-50">
      <div className="container max-w-3xl mx-auto text-center">
        <h2 className="font-display text-xl font-semibold text-ink mb-14">
          {t.logos.title}
        </h2>
        <div className="flex flex-nowrap items-center justify-center gap-12">
          {LOGOS.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-8 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
