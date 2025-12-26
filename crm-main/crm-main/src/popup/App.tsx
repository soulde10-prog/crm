import React, { useEffect, useState } from 'react'
import { Rnd } from 'react-rnd'
import { SyncIndicator } from './components/SyncIndicator'
import { ReadonlyBanner } from './components/ReadonlyBanner'
import { getProfile } from '../infra/auth'
import { currentRoute, navigate, Route } from './router'
import Workflow from './pages/Workflow'
import Pricing from './pages/Pricing'
import Templates from './pages/Templates'
import Forms from './pages/Forms'
import WorkspaceSettings from './pages/WorkspaceSettings'
import AuditLog from './pages/AuditLog'
import Onboarding from './pages/Onboarding'

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute())
  const [syncState, setSyncState] = useState<'idle'|'syncing'|'error'>('idle')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHash)
    getProfile().then(p => setUserEmail(p.email || null))
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    // example: respond to background sync state (optional)
    navigator.serviceWorker?.addEventListener('message', (ev: any) => {
      if (ev.data?.type === 'SYNC_STATE') setSyncState(ev.data.state)
    })
  }, [])

  return (
    <Rnd
      bounds="window"
      default={{ x: 100, y: 100, width: 760, height: 640 }}
      dragHandleClassName="crm-drag-handle"
    >
      <div className="crm-shell">
        <header className="crm-header crm-drag-handle">
          <div className="crm-title">Employee CRM</div>
          <div className="crm-controls">
            <SyncIndicator state={syncState} />
          </div>
        </header>

        { !userEmail && <div className="crm-body"><Onboarding /></div> }

        { userEmail && (
          <div className="crm-body">
            <aside className="crm-sidebar">
              <button onClick={() => navigate('workflow')}>Workflow</button>
              <button onClick={() => navigate('pricing')}>Pricing</button>
              <button onClick={() => navigate('templates')}>Templates</button>
              <button onClick={() => navigate('forms')}>Forms</button>
              <button onClick={() => navigate('settings')}>Workspace</button>
              <button onClick={() => navigate('audit')}>Audit</button>
            </aside>
            <main className="crm-main">
              <ReadonlyBanner />
              {route === 'workflow' && <Workflow />}
              {route === 'pricing' && <Pricing />}
              {route === 'templates' && <Templates />}
              {route === 'forms' && <Forms />}
              {route === 'settings' && <WorkspaceSettings />}
              {route === 'audit' && <AuditLog />}
            </main>
          </div>
        )}
      </div>
    </Rnd>
  )
}