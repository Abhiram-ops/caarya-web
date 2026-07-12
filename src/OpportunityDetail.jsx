import { useRef, useState } from 'react'
import './OpportunityDetail.css'

const EMPTY = new Set(['', 'not stated', 'none stated', 'n/a', 'na', 'null', 'unknown'])

function val(x) {
  const s = (x ?? '').toString().trim()
  return EMPTY.has(s.toLowerCase()) ? '' : s
}

function splitList(x) {
  return val(x)
    .split(/[,;]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

function toBullets(x) {
  let s = val(x)
  if (!s) return []
  // Drop a leading "… responsibilities include:" style preamble.
  s = s.replace(/^[^:]*responsibilities[^:]*:\s*/i, '')
  return s
    .split(/\s*\d+\.\s+|\s*[•\n]\s*/)
    .map((b) => b.trim().replace(/[.;]$/, ''))
    .filter(Boolean)
}

function initials(name) {
  const parts = val(name).split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
}

function Pill({ children }) {
  return <span className="oppd-pill">{children}</span>
}

function OpportunityDetail({ lead, onBack }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const company = val(lead['Company Name']) || 'Company'
  const role = val(lead['Role Title']) || 'Opportunity'
  const roleType = val(lead['Role Type'])
  const description = val(lead['Role Description']) || val(lead['Daily Responsibilities'])
  const duration = val(lead['Duration'])
  const location = val(lead['Location'])
  const workMode = val(lead['Work Mode'])
  const roleLevel = val(lead['Role Level'])
  const companyInfo = val(lead['Company Info'])
  const foundedYear = val(lead['Founded Year'])
  const website = val(lead['Company Website'])
  const skills = splitList(lead['Skills Required'])
  const responsibilities = toBullets(lead['Daily Responsibilities'])
  const deliverables = toBullets(lead['Deliverables'])
  const compensation = val(lead['Compensation'])
  const perks = splitList(lead['Perks'])
  const growth = val(lead['Growth Trajectory'])
  const applyLink = val(lead['Apply Link'])

  const isIntern = /intern/i.test(
    `${role} ${roleType} ${val(lead['Notes'])}`
  )
  const badge = isIntern ? 'Internship' : roleType || 'Opportunity'
  const locationLine = [location, workMode].filter(Boolean).join(' · ')

  // Build only the slides we can back with real data.
  const slides = []

  // 1 — Cover
  slides.push(
    <section className="oppd-slide slide-light slide-cover" key="cover">
      <div className="oppd-eyebrow">{company}</div>
      <h1 className="oppd-cover-title">{role}</h1>
      <span className="oppd-cover-badge">{badge}</span>
      {description && <p className="oppd-cover-desc">{description}</p>}
      <div className="oppd-fact-grid">
        {roleType && <Pill>{roleType}</Pill>}
        {duration && <Pill>{duration}</Pill>}
        {locationLine && <Pill>{locationLine}</Pill>}
        {roleLevel && <Pill>{roleLevel}</Pill>}
      </div>
      <div className="oppd-swipe">Swipe to explore opportunity →</div>
    </section>
  )

  // 2 — Who's behind this
  const aboutFallback = [
    foundedYear && `Founded ${foundedYear}.`,
    website && `Learn more at ${website}.`,
  ]
    .filter(Boolean)
    .join(' ')
  const aboutText = companyInfo || aboutFallback
  if (aboutText) {
    slides.push(
      <section className="oppd-slide slide-dark slide-about" key="about">
        <div className="oppd-card-cream">
          <h2 className="oppd-h2-dark">Who's behind this?</h2>
          <p className="oppd-about-text">{aboutText}</p>
        </div>
        <div className="oppd-wordmark">{company}</div>
      </section>
    )
  }

  // 3 — How you'll grow
  if (skills.length || responsibilities.length || deliverables.length) {
    const capabilities = responsibilities.length ? responsibilities : deliverables
    slides.push(
      <section className="oppd-slide slide-light slide-grow" key="grow">
        <h2 className="oppd-h1">How you'll grow</h2>
        {skills.length > 0 && (
          <>
            <div className="oppd-subhead">Skills &amp; tools you'll use</div>
            <div className="oppd-pill-wrap">
              {skills.map((s) => (
                <span className="oppd-skill-pill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
        {capabilities.length > 0 && (
          <div className="oppd-cap-card">
            <div className="oppd-cap-title">Capabilities you'll develop</div>
            <ul>
              {capabilities.slice(0, 5).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    )
  }

  // 4 — Beyond the experience
  if (compensation || perks.length || duration) {
    slides.push(
      <section className="oppd-slide slide-dark slide-beyond" key="beyond">
        <h2 className="oppd-h1-light">Beyond the experience</h2>
        <p className="oppd-sub-light">What you leave with, on paper and in practice</p>
        <div className="oppd-fact-grid">
          {compensation && <span className="oppd-pill-blush">{compensation}</span>}
          {duration && <span className="oppd-pill-blush">{duration}</span>}
          {perks.map((p) => (
            <span className="oppd-pill-blush" key={p}>
              {p}
            </span>
          ))}
        </div>
        <div className="oppd-resume-card">
          <div className="oppd-resume-head">
            <div className="oppd-avatar">{initials(company)}</div>
            <div>
              <div className="oppd-resume-company">{company}</div>
              {duration && <div className="oppd-resume-sub">{duration}</div>}
            </div>
          </div>
          <div className="oppd-resume-role">{role}</div>
          <div className="oppd-resume-sub">
            {[badge, locationLine].filter(Boolean).join(' · ')}
          </div>
          {responsibilities.length > 0 && (
            <ul className="oppd-resume-bullets">
              {responsibilities.slice(0, 5).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  // 5 — Future career pathways (only if we actually have growth data)
  if (growth) {
    slides.push(
      <section className="oppd-slide slide-dark slide-paths" key="paths">
        <h2 className="oppd-h1-light">Future career pathways</h2>
        <div className="oppd-path-card">
          <div className="oppd-path-role">Where this can lead</div>
          <p>{growth}</p>
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
        {applyLink && (
          <a className="oppd-cta-link" href={applyLink} target="_blank" rel="noreferrer">
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
        <div className="oppd-counter">
          {index + 1} / {slides.length}
        </div>
      </header>

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
    </div>
  )
}

export default OpportunityDetail
