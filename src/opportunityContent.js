// Shared field parsing + slide content model backing the plain-text/JSON
// designer content view (OpportunityContentView).

const EMPTY = new Set(['', 'not stated', 'none stated', 'n/a', 'na', 'null', 'unknown'])

export function val(x) {
  const s = (x ?? '').toString().trim()
  return EMPTY.has(s.toLowerCase()) ? '' : s
}

// Stable identifier for a lead — the sheet has no row ID, so company+role
// (same signal the scraper's own dedup check uses) stands in for one.
export function leadKey(lead) {
  const company = val(lead['Company Name']).toLowerCase()
  const role = val(lead['Role Title']).toLowerCase()
  return `${company}::${role}`
}

export function splitList(x) {
  return val(x)
    .split(/[,;]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function toBullets(x) {
  let s = val(x)
  if (!s) return []
  // Drop a leading "… responsibilities include:" style preamble.
  s = s.replace(/^[^:]*responsibilities[^:]*:\s*/i, '')
  return s
    .split(/\s*\d+\.\s+|\s*[•\n]\s*/)
    .map((b) => b.trim().replace(/[.;]$/, ''))
    .filter(Boolean)
}

// Derives every field the content view needs from a raw lead row.
export function deriveFields(lead) {
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

  const isIntern = /intern/i.test(`${role} ${roleType} ${val(lead['Notes'])}`)
  const badge = isIntern ? 'Internship' : roleType || 'Opportunity'
  const locationLine = [location, workMode].filter(Boolean).join(' · ')

  const aboutFallback = [
    foundedYear && `Founded ${foundedYear}.`,
    website && `Learn more at ${website}.`,
  ]
    .filter(Boolean)
    .join(' ')
  const aboutText = companyInfo || aboutFallback

  const capabilities = responsibilities.length ? responsibilities : deliverables

  return {
    company,
    role,
    roleType,
    description,
    duration,
    location,
    workMode,
    roleLevel,
    companyInfo,
    foundedYear,
    website,
    skills,
    responsibilities,
    deliverables,
    compensation,
    perks,
    growth,
    applyLink,
    badge,
    locationLine,
    aboutText,
    capabilities,
  }
}

// Plain-text slide-by-slide content, formatted for a designer to copy
// straight into a template.
export function buildContentSlides(lead) {
  const f = deriveFields(lead)
  const slides = []

  const factsLine = [f.roleType, f.duration, f.locationLine, f.roleLevel]
    .filter(Boolean)
    .join(' · ')
  slides.push({
    key: 'cover',
    title: 'Slide 1 — Cover',
    lines: [
      `Company: ${f.company}`,
      `Role: ${f.role}`,
      `Badge: ${f.badge}`,
      f.description && `Description: ${f.description}`,
      factsLine && `Quick facts: ${factsLine}`,
    ].filter(Boolean),
  })

  if (f.aboutText) {
    slides.push({
      key: 'about',
      title: "Slide 2 — Who's behind this?",
      lines: [f.aboutText, `— ${f.company}`],
    })
  }

  if (f.skills.length || f.capabilities.length) {
    const lines = ["Heading: How you'll grow"]
    if (f.skills.length) lines.push(`Skills & tools: ${f.skills.join(', ')}`)
    if (f.capabilities.length) {
      lines.push('Capabilities you\'ll develop:')
      f.capabilities.slice(0, 5).forEach((c) => lines.push(`• ${c}`))
    }
    slides.push({ key: 'grow', title: "Slide 3 — How you'll grow", lines })
  }

  if (f.compensation || f.perks.length || f.duration) {
    const factPills = [f.compensation, f.duration, ...f.perks].filter(Boolean)
    const lines = [
      'Heading: Beyond the experience',
      'Subhead: What you leave with, on paper and in practice',
      factPills.length && `Fact pills: ${factPills.join(' · ')}`,
      '',
      'Résumé-style card:',
      `${f.company} — ${f.duration || ''}`.trim(),
      f.role,
      [f.badge, f.locationLine].filter(Boolean).join(' · '),
    ]
    if (f.responsibilities.length) {
      f.responsibilities.slice(0, 3).forEach((b) => lines.push(`• ${b}`))
    }
    slides.push({
      key: 'beyond',
      title: 'Slide 4 — Beyond the experience',
      lines: lines.filter((l) => l !== false && l !== undefined),
    })
  }

  if (f.growth) {
    slides.push({
      key: 'paths',
      title: 'Slide 5 — Future career pathways',
      lines: ['Heading: Future career pathways', 'Where this can lead:', f.growth],
    })
  }

  slides.push({
    key: 'cta',
    title: `Slide ${slides.length + 1} — CTA`,
    lines: [
      'Brand: Caarya',
      'Students — apply to this opportunity using the link below.',
      f.applyLink && `Apply link: ${f.applyLink}`,
      'Building something and need talent like this? Reach out to Caarya — we curate, you meet the people already doing the work.',
      'partners@caarya.in',
      'Follow @caarya.daily for more opportunities',
    ].filter(Boolean),
  })

  return slides
}

export function slidesToPlainText(slides) {
  return slides
    .map((s) => `${s.title}\n${'-'.repeat(s.title.length)}\n${s.lines.join('\n')}`)
    .join('\n\n')
}

// Structured JSON — real fields per slide, not flattened text lines, so a
// script or template engine can consume it directly. Slides with no backing
// data are omitted, same rule as the text view.
export function buildContentJSON(lead) {
  const f = deriveFields(lead)
  const json = {}
  let n = 1

  json[`slide${n++}`] = {
    type: 'cover',
    company: f.company,
    role: f.role,
    badge: f.badge,
    description: f.description || null,
    facts: {
      roleType: f.roleType || null,
      duration: f.duration || null,
      location: f.locationLine || null,
      roleLevel: f.roleLevel || null,
    },
  }

  if (f.aboutText) {
    json[`slide${n++}`] = {
      type: 'about',
      heading: "Who's behind this?",
      body: f.aboutText,
      company: f.company,
    }
  }

  if (f.skills.length || f.capabilities.length) {
    json[`slide${n++}`] = {
      type: 'grow',
      heading: "How you'll grow",
      skills: f.skills,
      capabilities: f.capabilities.slice(0, 5),
    }
  }

  if (f.compensation || f.perks.length || f.duration) {
    json[`slide${n++}`] = {
      type: 'beyond',
      heading: 'Beyond the experience',
      subheading: 'What you leave with, on paper and in practice',
      compensation: f.compensation || null,
      duration: f.duration || null,
      perks: f.perks,
      resume: {
        company: f.company,
        duration: f.duration || null,
        role: f.role,
        badge: f.badge,
        location: f.locationLine || null,
        bullets: f.responsibilities.slice(0, 3),
      },
    }
  }

  if (f.growth) {
    json[`slide${n++}`] = {
      type: 'paths',
      heading: 'Future career pathways',
      body: f.growth,
    }
  }

  json[`slide${n++}`] = {
    type: 'cta',
    brand: 'Caarya',
    lead: 'Students — apply to this opportunity using the link below.',
    applyLink: f.applyLink || null,
    sub: 'Building something and need talent like this? Reach out to Caarya — we curate, you meet the people already doing the work.',
    email: 'partners@caarya.in',
    follow: '@caarya.daily',
  }

  return json
}
