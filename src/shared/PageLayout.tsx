import Nav from '../Nav'
import './PageLayout.css'

interface Props {
  title: string
  children: React.ReactNode
}

export default function PageLayout({ title, children }: Props) {
  return (
    <>
      <header className="poster-header">
        <div className="poster-bar poster-bar--top" />
        <div className="poster-center">
          <p className="poster-overline">גביע העולם FIFA</p>
          <div className="poster-mundial">MUNDIAL <span className="poster-year">2026</span></div>
          <h1 className="poster-subtitle">{title}</h1>
        </div>
        <div className="poster-bar poster-bar--bottom" />
      </header>
      <Nav />
      {children}
    </>
  )
}
