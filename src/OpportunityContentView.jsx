import { useState } from 'react'
import { slidesToPlainText } from './opportunityContent'

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API can fail (permissions, non-secure context) —
      // the text is still selectable/visible either way.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className="occ-copy-btn" onClick={copy}>
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

function OpportunityContentView({ slides }) {
  const fullText = slidesToPlainText(slides)

  return (
    <div className="occ-wrap">
      <div className="occ-toolbar">
        <p className="occ-hint">
          Plain-text content for each slide — select a block, or copy everything at
          once, and drop it into the design template.
        </p>
        <CopyButton text={fullText} label="Copy all slides" />
      </div>

      {slides.map((slide) => (
        <div className="occ-slide-block" key={slide.key}>
          <div className="occ-slide-head">
            <h3>{slide.title}</h3>
            <CopyButton text={slide.lines.join('\n')} label="Copy slide" />
          </div>
          <pre className="occ-slide-body">{slide.lines.join('\n')}</pre>
        </div>
      ))}
    </div>
  )
}

export default OpportunityContentView
