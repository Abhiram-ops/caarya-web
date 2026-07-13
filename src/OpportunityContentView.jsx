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

function OpportunityContentView({ slides, json }) {
  const [format, setFormat] = useState('text')
  const fullText = slidesToPlainText(slides)
  const jsonText = JSON.stringify(json, null, 2)

  return (
    <div className="occ-wrap">
      <div className="occ-toolbar">
        <p className="occ-hint">
          Ready-to-paste content for each slide — copy a single block, or grab
          everything at once, and drop it into the design template.
        </p>
        <div className="occ-format-toggle">
          <button
            className={format === 'text' ? 'active' : ''}
            onClick={() => setFormat('text')}
          >
            Text
          </button>
          <button
            className={format === 'json' ? 'active' : ''}
            onClick={() => setFormat('json')}
          >
            JSON
          </button>
        </div>
        <CopyButton
          text={format === 'text' ? fullText : jsonText}
          label={format === 'text' ? 'Copy all slides' : 'Copy JSON'}
        />
      </div>

      {format === 'text' ? (
        slides.map((slide) => (
          <div className="occ-slide-block" key={slide.key}>
            <div className="occ-slide-head">
              <h3>{slide.title}</h3>
              <CopyButton text={slide.lines.join('\n')} label="Copy slide" />
            </div>
            <pre className="occ-slide-body">{slide.lines.join('\n')}</pre>
          </div>
        ))
      ) : (
        <div className="occ-slide-block">
          <pre className="occ-slide-body">{jsonText}</pre>
        </div>
      )}
    </div>
  )
}

export default OpportunityContentView
