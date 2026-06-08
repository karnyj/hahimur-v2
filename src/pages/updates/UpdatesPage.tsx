import PageLayout from '../../shared/PageLayout'
import { UPDATES } from './updates'
import './UpdatesPage.css'

export default function UpdatesPage() {
  return (
    <PageLayout title="עדכונים">
      <main dir="rtl" className="updates-page">
        {UPDATES.map((update, idx) => (
          <article
            key={update.id}
            className="update-card"
            style={{ animationDelay: `${idx * 0.1 + 0.05}s` }}
          >
            <div className="update-card__meta">
              <span className="update-card__date">{update.date}</span>
              <span className="update-card__edition">גיליון {update.id}</span>
            </div>

            <div className="update-card__content">
              <h2 className="update-card__subject">{update.subject}</h2>

              <div className="update-card__body">
                {update.paragraphs.map((p, i) => (
                  <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>
                ))}
              </div>

              {update.pdfFilename && (
                <div className="update-card__pdf-section">
                  <div className="update-card__pdf-header">
                    <span className="update-card__pdf-icon">📎</span>
                    <span className="update-card__pdf-label">
                      {update.pdfLabel ?? update.pdfFilename}
                    </span>
                  </div>
                  <iframe
                    src={`/${update.pdfFilename}`}
                    title={update.pdfLabel ?? update.pdfFilename}
                    className="update-card__pdf-frame"
                  />
                </div>
              )}
            </div>
          </article>
        ))}
      </main>
    </PageLayout>
  )
}
