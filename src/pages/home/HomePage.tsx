import Nav from '../../Nav'

export default function HomePage() {
  return (
    <>
      <header className="poster-header">
        <div className="poster-bar poster-bar--top" />
        <div className="poster-center">
          <p className="poster-overline">גביע העולם FIFA</p>
          <div className="poster-mundial">MUNDIAL <span className="poster-year">2026</span></div>
          <h1 className="poster-subtitle">ההימור 2026</h1>
        </div>
        <div className="poster-bar poster-bar--bottom" />
      </header>
      <Nav />

      <main dir="rtl" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem', fontSize: '1.1rem', lineHeight: '1.9' }}>
        <p>ברוכים הבאים להימור המסורתי שלנו!</p>
        <p>
          לרגל חגיגות ה-20 שנים (!) לטורניר שלנו אנו בפתחו של ההימור ה-12 - שצפוי להיות ההימור התחרותי ביותר.
          ריבוי המשחקים, מיעוט הפייבורטיות ושיטות הצלבה קשוחות גורמות לכך שלהערכתי יהיה קשה מאוד למישהו להוליך
          באופן בולט ואני צופה שיהיה לנו מתח בין הרבה מאוד מתמודדים עד השלבים האחרונים.
        </p>
        <p>
          לא פחות מ-29 אנשים הצליחו להגיע בעבר לתואר הפודיום ולהרגיש את טעם ההצלחה לפחות באחד הטורנירים.
          מצד שני יש מספר מתמודדים שאיתנו כבר הרבה מאוד שנים כמו אדם, אורן, אגפים ומלמד אשר כולי תקווה
          שיזכו השנה לרוץ בצמרת ולהרגיש את המתח עד הרגעים האחרונים!
        </p>
        <p>
          מאחל לכולם טורניר מוצלח — והלוואי וההימור שלנו יגרום לרגעי שמחה, מתח, תחרות ובעיקר יציל את
          המונדיאל שפיפ"א מנסה בכל הכח להרוס.
        </p>
      </main>
    </>
  )
}
