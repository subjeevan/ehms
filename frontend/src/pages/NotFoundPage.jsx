import { Link } from 'react-router-dom'
export default function NotFoundPage() { return <main className="center-page"><div className="center-card"><span className="error-code">404</span><h1>Page not found</h1><p>The requested HMS page does not exist.</p><Link className="button primary" to="/dashboard">Go to dashboard</Link></div></main> }
