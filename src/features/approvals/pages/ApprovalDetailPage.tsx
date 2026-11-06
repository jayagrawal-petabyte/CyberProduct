import { Link, useLocation, useParams } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import '../styles/approvalInbox.css'

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/lead/') ? '/lead/approvals' : '/approvals'
  return <main className="approval-page approval-detail-page">
    <header className="approval-brand-header"><img src="/assets/brainmint-logo.png" alt="BrainMint" /></header>
    <section className="approval-state approval-detail-state"><ApprovalIcon name="clipboard" size={38} /><span>Request {id}</span><h1>Request details are coming next</h1><p>The details review workflow is not part of the Approval Inbox task.</p><Link to={basePath}><ApprovalIcon name="chevron-left" size={16} />Back to access requests</Link></section>
  </main>
}
