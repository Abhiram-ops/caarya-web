import './OpportunityDetail.css'
import { buildContentSlides, buildContentJSON } from './opportunityContent'
import OpportunityContentView from './OpportunityContentView'

function OpportunityDetail({ lead, onBack }) {
  const contentSlides = buildContentSlides(lead)
  const contentJSON = buildContentJSON(lead)

  return (
    <div className="oppd-page">
      <header className="oppd-header">
        <button className="oppd-back" onClick={onBack}>
          ← Back to leads
        </button>
        <h1 className="oppd-title">Content for Designer</h1>
      </header>

      <OpportunityContentView slides={contentSlides} json={contentJSON} />
    </div>
  )
}

export default OpportunityDetail
