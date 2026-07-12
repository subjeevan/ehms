import { Link } from 'react-router-dom'
export default function AccessDeniedPage() { return <main className="center-page"><div className="center-card"><span className="error-code">403</span><h1>Access denied</h1><p>Your account does not have permission to open this page.</p><Link className="button primary" to="/dashboard">Return to dashboard</Link></div></main> }
