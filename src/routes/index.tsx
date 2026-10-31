import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
const INTRO_PORTRAIT = "/img/togami-intro.png";
const FACE_CLOSEUP = "https://togamigenshiro.github.io/img/togami-face.png";
const SHARE_IMAGE = "https://togamigenshiro.github.io/img/share-roses.jpg";
import { Petals, RoseMark } from "@/components/Petals";
import { Fx, type FxKind } from "@/components/Fx";
import { Rich } from "@/components/StoryFlow";
import { AudioLines, ArrowUpRight } from "lucide-react";
import { togamiProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Togami Genshiro" },
      { name: "description", content: "....." },
      { property: "og:title", content: "Togami Genshiro" },
      { property: "og:description", content: "....." },
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:image:alt", content: "A bed of deep crimson roses" },
      { property: "og:url", content: "https://togamigenshiro.github.io/" },
      { name: "twitter:title", content: "Togami Genshiro" },
      { name: "twitter:description", content: "....." },
      { name: "twitter:image", content: SHARE_IMAGE },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const traits: { jp: string; en: string; fx: FxKind; text: string }[] = [
  {
    jp: "性格",
    en: "Personality",
    fx: "sword",
    text: "Arrogant, cynical and never without a smug smirk. On a contract he is stern, cold and completely serious. Off the clock he is *shamelessly flirtatious* with women, and openly rude to any man who crosses his path.",
  },
  {
    jp: "好物",
    en: "Likes",
    fx: "bloom",
    text: "Horticulture above all. He spends his hard-earned blood money on rare seeds and a meticulous garden. He also has a weakness for *women with a fierce character*.",
  },
  {
    jp: "嫌物",
    en: "Dislikes",
    fx: "kimono",
    text: "The standardized dress every proper citizen is expected to wear. He respects the laws of the land, yet that uniform disgusts him, and it keeps him in endless arguments. He has also grown to hate {snow}. Although that story is for another time...",
  },
  {
    jp: "趣味",
    en: "Hobbies",
    fx: "coin",
    text: "Hunting *coin-heavy contracts* and any way to make money. Collecting countless flowers, tending his garden, and testing how they react to every environment. He even carries vials of flowers in case the weather turns.",
  },
];

function Index() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center">
        <Petals />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pt-28 md:grid-cols-[1fr_1.1fr]">
          <motion.div
            className="relative mx-auto aspect-[4/5] w-full max-w-md"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <div className="absolute -inset-3 border border-gold/40" />
            <img src={INTRO_PORTRAIT} alt="Togami Genshiro in his blood-red kimono" className="h-full w-full object-cover object-top shadow-2xl" />
            <span className="font-brush text-vertical absolute -right-12 top-4 hidden text-5xl text-primary glow-red md:block">玄城戸上</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.6 }}>
            <p className="font-display text-xs uppercase tracking-[0.5em] text-gold">Kyōto · 京都</p>
            <h1 className="mt-4 font-display text-6xl font-extrabold leading-none text-paper md:text-8xl">
              Togami
              <span className="block text-primary glow-red">Genshiro</span>
            </h1>
            <p className="mt-8 max-w-md text-2xl italic text-foreground/90">
              "The law is a chain. I only read the gaps between its links."
            </p>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              A disgraced ronin living the flashy life of a kabukimono. A freelance bounty hunter who bends every local law to his advantage, and who hides a strange, sincere obsession with collecting red roses.
            </p>
            <dl className="mt-7 grid max-w-md grid-cols-3 gap-4 border-y border-gold/25 py-4">
              {[
                ["Nationality", togamiProfile.nationality],
                ["Age", `${togamiProfile.age}`],
                ["Height", `${togamiProfile.heightFeet}′${togamiProfile.heightInches}″`],
              ].map(([label, value]) => <div key={label}>
                <dt className="font-display text-xs uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-display text-xl text-gold">{value}</dd>
              </div>)}
            </dl>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/story" className="bg-primary px-7 py-3 font-display text-sm uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-blood">
                Read his story
              </Link>
              <Link to="/weapon" className="border border-gold/50 px-7 py-3 font-display text-sm uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10">
                The rose blade
              </Link>
            </div>
            <a href="https://www.youtube.com/watch?v=vlLWYMzNGTE" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-3 border-b border-gold/40 pb-2 font-body text-lg text-gold transition-colors hover:text-paper">
              <AudioLines className="h-5 w-5" aria-hidden="true" />
              <span>Voiceclaim · Gin Ichimaru <span className="text-sm italic text-muted-foreground">— Bleach</span></span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Traits */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 flex items-center justify-center gap-4">
          <RoseMark className="h-7 w-7" />
          <h2 className="font-display text-3xl font-bold tracking-widest text-paper md:text-4xl">- 人物 -</h2>
          <RoseMark className="h-7 w-7" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {traits.map((t, i) => (
            <motion.article
              key={t.en}
              className="panel grain relative rounded-sm p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: (i % 2) * 0.15 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-brush text-3xl text-primary">{t.jp}</p>
                  <h3 className="font-display text-sm uppercase tracking-[0.4em] text-gold">{t.en}</h3>
                </div>
                <Fx kind={t.fx} />
              </div>
              <div className="my-4 h-px w-16 bg-primary" />
              <p className="text-lg leading-relaxed"><Rich text={t.text} /></p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 pb-32 pt-10 text-center md:flex-row md:text-left">
        <div className="animate-drift shrink-0"><img src={FACE_CLOSEUP} alt="Close-up of Togami's face" className="h-64 w-56 object-cover shadow-2xl ring-1 ring-gold/40" /></div>
        <div>
          <p className="font-brush text-4xl text-primary">棘ある薔薇</p>
          <p className="mt-3 text-2xl italic">Every rose he keeps was paid for in blood. Most of it wasn't his.</p>
          <Link to="/story" className="mt-6 inline-block font-display text-sm uppercase tracking-[0.3em] text-gold underline-offset-8 hover:underline">
            Chapter 1 →
          </Link>
        </div>
      </section>
    </main>
  );
}
