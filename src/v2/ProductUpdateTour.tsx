import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Flag, Image, Layers3, Link2, Sparkles, Target, Upload, Users } from "lucide-react";

export const PRODUCT_TOUR_PAGE_COUNT = 8;

interface ProductUpdateTourProps {
  replaying?: boolean;
  onComplete: () => void | Promise<void>;
  onSkip: () => void | Promise<void>;
}

const examples = ["Japan 2028", "Date Nights", "Becoming a Pilot", "My Health Journey"];

export function ProductUpdateTour({ replaying = false, onComplete, onSkip }: ProductUpdateTourProps) {
  const [page, setPage] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = page === PRODUCT_TOUR_PAGE_COUNT - 1;

  useEffect(() => {
    headingRef.current?.focus();
  }, [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && page < PRODUCT_TOUR_PAGE_COUNT - 1) setPage(value => value + 1);
      if (event.key === "ArrowLeft" && page > 0) setPage(value => value - 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [page]);

  const exit = async (handler: () => void | Promise<void>) => {
    if (finishing) return;
    setFinishing(true);
    try { await handler(); } finally { setFinishing(false); }
  };
  const next = () => last ? void exit(onComplete) : setPage(value => value + 1);

  return (
    <main className={`product-tour product-tour-page-${page + 1}`} aria-labelledby="product-tour-title">
      <div className="product-tour-ambient" aria-hidden="true" />
      <header className="product-tour-topbar">
        <div className="product-tour-brand"><Compass aria-hidden="true" /><span>SideQuest</span></div>
        {!last && <button className="product-tour-skip" onClick={() => void exit(onSkip)} disabled={finishing}>{replaying ? "Close" : "Skip"}</button>}
      </header>

      <section className="product-tour-stage" aria-live="polite">
        {page === 0 && <div className="product-tour-split product-tour-welcome">
          <div className="product-tour-copy">
            <p className="eyebrow">A new chapter</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Welcome to the new SideQuest.</h1>
            <p className="product-tour-lead">You've always collected possibilities.</p>
            <p>Now they're becoming stories.</p>
            <p>Everything has been redesigned to help you focus less on organizing ideas—and more on living them.</p>
          </div>
          <figure className="product-tour-photo product-tour-photo-future"><img src="/onboarding/future-overlook.webp" alt="Two friends looking across a sunlit mountain valley" /></figure>
        </div>}

        {page === 1 && <div className="product-tour-split product-tour-hero-page">
          <figure className="product-tour-photo product-tour-photo-hero"><img src="/onboarding/future-overlook.webp" alt="A shared adventure overlooking the mountains" /></figure>
          <div className="product-tour-copy">
            <p className="eyebrow">Your story, in motion</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Every story has a main character.</h1>
            <p className="product-tour-lead">Your Home now revolves around one living Quest—the possibility growing into something real.</p>
            <div className="product-tour-pillars"><span><Sparkles />Hero Quest</span><span><Users />Momentum</span><span><ArrowRight />Continue Building</span></div>
          </div>
        </div>}

        {page === 2 && <div className="product-tour-centered">
          <div className="product-tour-copy">
            <p className="eyebrow">Meaningful movement</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Progress that actually means something.</h1>
            <p className="product-tour-lead">Milestones aren't checklists. They're meaningful moments worth celebrating.</p>
            <p>Only Goals show percentages. Everything else grows through memories, people, and experiences.</p>
          </div>
          <div className="milestone-story" aria-label="An example Journey with meaningful milestones">
            <div className="milestone-story-line" />
            <article><span><Check /></span><div><small>May 12</small><b>Passport approved</b><p>The trip began to feel real.</p></div></article>
            <article className="active"><span><Flag /></span><div><small>June 2</small><b>Booked the flights</b><p>A moment worth remembering.</p></div></article>
            <article><span><Sparkles /></span><div><small>Next</small><b>See where the story goes</b></div></article>
          </div>
        </div>}

        {page === 3 && <div className="product-tour-split product-tour-chapter-page">
          <div className="product-tour-copy">
            <p className="eyebrow">The bigger picture</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Your life is bigger than individual Quests.</h1>
            <p className="product-tour-lead">Collections gather possibilities. Life Chapters tell the story of an important part of your life.</p>
            <div className="chapter-examples">{examples.map((example, index) => <span key={example}><b>0{index + 1}</b>{example}</span>)}</div>
          </div>
          <div className="chapter-book" aria-label="Collections becoming a Life Chapter"><div className="chapter-cover"><BookOpen /><small>Life Chapter</small><strong>Japan<br />2028</strong><span>A story waiting to unfold</span></div><div className="chapter-page"><Layers3 /><b>12 Quests</b><p>Places, food, people, and moments gathering into one chapter.</p></div></div>
        </div>}

        {page === 4 && <div className="product-tour-split product-tour-memory-page">
          <figure className="product-tour-photo product-tour-photo-memory"><img src="/onboarding/memory-dinner.webp" alt="Friends sharing a warm outdoor dinner together" loading="lazy" decoding="async" /></figure>
          <div className="product-tour-copy">
            <p className="eyebrow">Worth remembering</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Memories are no longer the ending.</h1>
            <p className="product-tour-lead">When a Quest becomes a Memory, it doesn't disappear.</p>
            <p>It becomes part of your story.</p>
            <blockquote>“We said we'd do this someday. Then we did.”</blockquote>
          </div>
        </div>}

        {page === 5 && <div className="product-tour-split product-tour-capture-page">
          <div className="product-tour-copy">
            <p className="eyebrow">From spark to Quest</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Capture inspiration in seconds.</h1>
            <p className="product-tour-lead">Save a photo. Save a place. Save a link.</p>
            <p>Everything else can wait.</p>
          </div>
          <div className="capture-demo" aria-label="Quick Capture example"><div className="capture-demo-head"><Sparkles /><b>What made you stop and think?</b></div><div className="capture-input">Sunset picnic by the lake<span>Paste, type, or add a photo</span></div><div className="capture-kinds"><span><Image />Photo</span><span><Link2 />Link</span><span><Upload />Place</span></div><button tabIndex={-1}>Save this possibility</button></div>
        </div>}

        {page === 6 && <div className="product-tour-centered product-tour-calm-page">
          <div className="product-tour-copy">
            <p className="eyebrow">Designed around your life</p>
            <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Built to feel calm.</h1>
            <p className="product-tour-lead">Everything has been redesigned around one idea:</p>
            <p className="product-tour-manifesto">Collect inspiration today.<br />Live it tomorrow.</p>
          </div>
          <div className="product-tour-collage" aria-hidden="true"><div className="collage-hero"><img src="/onboarding/future-overlook.webp" alt="" /></div><div className="collage-quest"><Target /><b>Learn to sail</b><small>This is starting to feel real.</small></div><div className="collage-memory"><img src="/onboarding/memory-dinner.webp" alt="" /><span>Worth remembering</span></div><div className="collage-chapter"><BookOpen /><b>Summer 2028</b></div></div>
        </div>}

        {page === 7 && <div className="product-tour-finale">
          <div className="product-tour-finale-mark"><Sparkles /></div>
          <p className="eyebrow">Welcome back</p>
          <h1 id="product-tour-title" ref={headingRef} tabIndex={-1}>Let's build a life worth remembering.</h1>
          <p className="product-tour-lead">Continue where your story left off.</p>
          <button className="primary product-tour-finish" onClick={() => void exit(onComplete)} disabled={finishing}>{finishing ? "Opening your story…" : "Continue"} <ArrowRight /></button>
          <button className="link product-tour-later" onClick={() => void exit(onComplete)} disabled={finishing}>View What's New Again Later</button>
        </div>}
      </section>

      <footer className="product-tour-controls">
        <button className="product-tour-back" onClick={() => setPage(value => Math.max(0, value - 1))} disabled={page === 0} aria-label="Previous page"><ArrowLeft /> Back</button>
        <div className="product-tour-dots" role="img" aria-label={`Page ${page + 1} of ${PRODUCT_TOUR_PAGE_COUNT}`}>{Array.from({ length: PRODUCT_TOUR_PAGE_COUNT }, (_, index) => <span key={index} aria-current={index === page ? "step" : undefined} />)}</div>
        {last ? <span className="product-tour-control-spacer" aria-hidden="true" /> : <button className="product-tour-next" onClick={next} disabled={finishing}>{page === 0 ? "Show me what's new" : "Next"} <ArrowRight /></button>}
      </footer>
    </main>
  );
}