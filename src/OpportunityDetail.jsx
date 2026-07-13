import { useRef, useState } from 'react'
import './OpportunityDetail.css'
import { deriveFields, initials, buildContentSlides, buildContentJSON } from './opportunityContent'
import OpportunityContentView from './OpportunityContentView'

function Pill({ children }) {
  return <span className="oppd-pill">{children}</span>
}

function buildCarouselSlides(f) {
  const slides = []

  // 1 — Cover
  slides.push(
    <section className="oppd-slide slide-light slide-cover" key="cover">
      <div className="oppd-eyebrow">{f.company}</div>
      <h1 className="oppd-cover-title">{f.role}</h1>
      <span className="oppd-cover-badge">{f.badge}</span>
      {f.description && <p className="oppd-cover-desc">{f.description}</p>}
      <div className="oppd-fact-grid">
        {f.roleType && <Pill>{f.roleType}</Pill>}
        {f.duration && <Pill>{f.duration}</Pill>}
        {f.locationLine && <Pill>{f.locationLine}</Pill>}
        {f.roleLevel && <Pill>{f.roleLevel}</Pill>}
      </div>
      <div className="oppd-swipe">Swipe to explore opportunity →</div>
    </section>
  )

  // 2 — Who's behind this
  if (f.aboutText) {
    slides.push(
      <section className="oppd-slide slide-dark slide-about" key="about">
        <div className="oppd-card-cream">
          <h2 className="oppd-h2-dark">Who's behind this?</h2>
          <p className="oppd-about-text">{f.aboutText}</p>
        </div>
        <div className="oppd-wordmark">{f.company}</div>
      </section>
    )
  }

  // 3 — How you'll grow
  if (f.skills.length || f.capabilities.length) {
    slides.push(
      <section className="oppd-slide slide-light slide-grow" key="grow">
        <h2 className="oppd-h1">How you'll grow</h2>
        {f.skills.length > 0 && (
          <>
            <div className="oppd-subhead">Skills &amp; tools you'll use</div>
            <div className="oppd-pill-wrap">
              {f.skills.map((s) => (
                <span className="oppd-skill-pill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
        {f.capabilities.length > 0 && (
          <div className="oppd-cap-card">
            <div className="oppd-cap-title">Capabilities you'll develop</div>
            <ul>
              {f.capabilities.slice(0, 5).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    )
  }

  // 4 — Beyond the experience
  if (f.compensation || f.perks.length || f.duration) {
    slides.push(
      <section className="oppd-slide slide-dark slide-beyond" key="beyond">
        <h2 className="oppd-h1-light">Beyond the experience</h2>
        <p className="oppd-sub-light">What you leave with, on paper and in practice</p>
        <div className="oppd-fact-grid">
          {f.compensation && <span className="oppd-pill-blush">{f.compensation}</span>}
          {f.duration && <span className="oppd-pill-blush">{f.duration}</span>}
          {f.perks.map((p) => (
            <span className="oppd-pill-blush" key={p}>
              {p}
            </span>
          ))}
        </div>
        <div className="oppd-resume-card">
          <div className="oppd-resume-head">
            <div className="oppd-avatar">{initials(f.company)}</div>
            <div>
              <div className="oppd-resume-company">{f.company}</div>
              {f.duration && <div className="oppd-resume-sub">{f.duration}</div>}
            </div>
          </div>
          <div className="oppd-resume-role">{f.role}</div>
          <div className="oppd-resume-sub">
            {[f.badge, f.locationLine].filter(Boolean).join(' · ')}
          </div>
          {f.responsibilities.length > 0 && (
            <ul className="oppd-resume-bullets">
              {f.responsibilities.slice(0, 3).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  // 5 — Future career pathways (only if we actually have growth data)
  if (f.growth) {
    slides.push(
      <section className="oppd-slide slide-dark slide-paths" key="paths">
        <h2 className="oppd-h1-light">Future career pathways</h2>
        <div className="oppd-path-card">
          <div className="oppd-path-role">Where this can lead</div>
          <p>{f.growth}</p>
        </div>
      </section>
    )
  }

  // 6 — CTA / outro
  slides.push(
    <section className="oppd-slide slide-dark slide-cta" key="cta">
      <div className="oppd-cta-card">
        <div className="oppd-cta-brand">Caarya</div>
        <p className="oppd-cta-lead">
          Students — apply to this opportunity using the link below.
        </p>
        {f.applyLink && (
          <a className="oppd-cta-link" href={f.applyLink} target="_blank" rel="noreferrer">
            Apply now
          </a>
        )}
        <p className="oppd-cta-sub">
          Building something and need talent like this? Reach out to Caarya —
          we curate, you meet the people already doing the work.
        </p>
        <div className="oppd-cta-mail">partners@caarya.in</div>
      </div>
      <div className="oppd-cta-follow">Follow @caarya.daily for more opportunities</div>
    </section>
  )

  return slides
}

function OpportunityDetail({ lead, onBack }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState('carousel')

  const fields = deriveFields(lead)
  const slides = buildCarouselSlides(fields)
  const contentSlides = buildContentSlides(lead)
  const contentJSON = buildContentJSON(lead)

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, i))
    setIndex(clamped)
    const track = trackRef.current
    if (track) {
      // Set scrollLeft directly (CSS scroll-behavior handles the smoothness) —
      // scrollTo({behavior:'smooth'}) gets cancelled by the mandatory snap track.
      track.scrollLeft = track.clientWidth * clamped
    }
  }

  const onScroll = () => {
    const track = trackRef.current
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className="oppd-page">
      <header className="oppd-header">
        <button className="oppd-back" onClick={onBack}>
          ← Back to leads
        </button>
        <div className="oppd-tabs">
          <button
            className={tab === 'carousel' ? 'active' : ''}
            onClick={() => setTab('carousel')}
          >
            Carousel
          </button>
          <button
            className={tab === 'content' ? 'active' : ''}
            onClick={() => setTab('content')}
          >
            Content for designer
          </button>
        </div>
        {tab === 'carousel' && (
          <div className="oppd-counter">
            {index + 1} / {slides.length}
          </div>
        )}
      </header>

      {tab === 'carousel' ? (
        <>
          <div className="oppd-stage">
            <button
              className="oppd-arrow oppd-arrow-left"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous slide"
            >
              ‹
            </button>

            <div className="oppd-track" ref={trackRef} onScroll={onScroll}>
              {slides}
            </div>

            <button
              className="oppd-arrow oppd-arrow-right"
              onClick={() => goTo(index + 1)}
              disabled={index === slides.length - 1}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>

          <div className="oppd-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`oppd-dot ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : (
        <OpportunityContentView slides={contentSlides} json={contentJSON} />
      )}
    </div>
  )
}

export default OpportunityDetail
