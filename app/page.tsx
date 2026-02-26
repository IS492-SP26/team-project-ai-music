import Link from "next/link"
import { Music, FileText, Download, GraduationCap, ArrowRight, Headphones, Wand2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="size-4 text-primary" />
          <span>AI-powered music creation for beginners</span>
        </div>

        <h1
          className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Create Your First Beat with AI
        </h1>

        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Guided music creation for beginners. Generate song scripts, build beats,
          and learn music fundamentals — all in one place.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2 rounded-2xl bg-primary px-8 text-primary-foreground hover:bg-primary/90">
            <Link href="/create">
              Start Creating
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 rounded-2xl border-border/60 bg-secondary/30 text-foreground hover:bg-secondary/50"
          >
            <a href="#features">
              Learn More
            </a>
          </Button>
        </div>
      </div>

      {/* Floating music notes decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[10%] top-[20%] animate-pulse text-primary/20">
          <Music className="size-8" />
        </div>
        <div className="absolute right-[15%] top-[30%] animate-pulse text-accent/20" style={{ animationDelay: "1s" }}>
          <Headphones className="size-10" />
        </div>
        <div className="absolute bottom-[25%] left-[20%] animate-pulse text-primary/15" style={{ animationDelay: "2s" }}>
          <Music className="size-6" />
        </div>
        <div className="absolute bottom-[30%] right-[10%] animate-pulse text-accent/15" style={{ animationDelay: "0.5s" }}>
          <Wand2 className="size-7" />
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: FileText,
    title: "Generate Song Scripts",
    description:
      "Get structured lyrics with intros, verses, choruses, bridges, and outros — all tailored to your theme and mood.",
  },
  {
    icon: Music,
    title: "Generate Beginner Beats",
    description:
      "Create simple chord progressions, drum patterns, and melodies based on your selected mood and tempo.",
  },
  {
    icon: Download,
    title: "Export MIDI Files",
    description:
      "Download your generated beats as MIDI files and import them into GarageBand, FL Studio, or any DAW.",
  },
  {
    icon: GraduationCap,
    title: "Learn While You Create",
    description:
      "Every generation comes with plain-English explanations of why each musical choice was made.",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Everything you need to start making music
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            BeatAI is not a one-click song generator. It is a guided creation
            and teaching tool designed to help you understand music fundamentals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-8 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-6" />
              </div>
              <h3
                className="mb-2 text-lg font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {feature.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/50 px-8 py-16 backdrop-blur-sm">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 h-[200px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <h2
              className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ready to make your first beat?
            </h2>
            <p className="mb-8 text-pretty text-muted-foreground">
              No experience needed. Just tell the AI what your song is about and
              let it guide you through the creation process.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-2xl bg-primary px-8 text-primary-foreground hover:bg-primary/90">
              <Link href="/create">
                Start Creating
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/30 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Music className="size-5 text-primary" />
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            BeatAI
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built for beginner music creators.
        </p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Music className="size-5 text-primary" />
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              BeatAI
            </span>
          </div>
          <Button asChild size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/create">Start Creating</Link>
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
