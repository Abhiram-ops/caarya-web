import './OpportunityDetail.css'
import {
  buildContentSlides, buildContentJSON,
  buildGeneratedSlides, buildGeneratedJSON, hasGeneratedCarousel,
} from './opportunityContent'
import OpportunityContentView from './OpportunityContentView'

function OpportunityDetail({ lead, onBack }) {
  const generated = hasGeneratedCarousel(lead)
  const contentSlides = generated ? buildGeneratedSlides(lead) : buildContentSlides(lead)
  const contentJSON = generated ? buildGeneratedJSON(lead) : buildContentJSON(lead)

  return (
    <div className="oppd-page">
      <header className="oppd-header">
        <button className="oppd-back" onClick={onBack}>
          ← Back to leads
        </button>
        <h1 className="oppd-title">Content for Designer</h1>
      </header>

      {generated && (
        <p className="oppd-ai-note">
          AI-generated (Flow 2) — includes Human Centricity &amp; Fit Check. Confidence
          score shown per slide; ⚠ flags anything under 70% worth double-checking.
        </p>
      )}

      <OpportunityContentView slides={contentSlides} json={contentJSON} />
    </div>
  )
}

export default OpportunityDetail
