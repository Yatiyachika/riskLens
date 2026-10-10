import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Card, Field, Select, Tabs, Toggle, inputCls } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { CURRENT_USER } from '../data/mockData';

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div><p className="text-sm font-medium text-slate-800">{title}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { notify } = useApp();
  const [tab, setTab] = useState('profile');
  const [s, setS] = useState({
    name: CURRENT_USER.name, email: CURRENT_USER.email, role: CURRENT_USER.role, tz: 'Asia/Kolkata',
    emailAlerts: true, push: true, digest: false, slack: true,
    high: 70, medium: 40, autoEscalate: 90,
    sort: 'Newest first', autoAssign: true, sound: false,
    mfa: true, session: '30', apiUrl: 'https://api.risklens.io/v1', apiKey: 'rl_live_••••••••••••9f3a', webhook: true,
  });
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((p) => ({ ...p, [k]: v }));
  const save = () => notify('Settings saved');

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, alerting and integrations" />
      <Card bodyClass="p-0">
        <div className="px-4 pt-1">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'profile', label: 'Profile' }, { id: 'notifications', label: 'Notifications' }, { id: 'thresholds', label: 'Risk thresholds' },
            { id: 'prefs', label: 'Alert preferences' }, { id: 'security', label: 'Security' }, { id: 'api', label: 'API configuration' },
          ]} />
        </div>
        <div className="max-w-2xl p-5">
          {tab === 'profile' && (
            <div className="space-y-4">
              <Field label="Full name"><input className={inputCls} value={s.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} type="email" value={s.email} onChange={(e) => set('email', e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role"><input className={inputCls} value={s.role} readOnly /></Field>
                <Field label="Time zone"><Select value={s.tz} onChange={(e) => set('tz', e.target.value)}><option>Asia/Kolkata</option><option>Asia/Singapore</option><option>Europe/London</option><option>America/New_York</option></Select></Field>
              </div>
            </div>
          )}
          {tab === 'notifications' && (
            <div>
              <Row title="Email alerts" hint="Send high-risk alerts to your inbox"><Toggle label="Email alerts" checked={s.emailAlerts} onChange={(v) => set('emailAlerts', v)} /></Row>
              <Row title="Push notifications" hint="Browser and mobile notifications"><Toggle label="Push notifications" checked={s.push} onChange={(v) => set('push', v)} /></Row>
              <Row title="Slack integration" hint="Post critical alerts to #fraud-ops"><Toggle label="Slack integration" checked={s.slack} onChange={(v) => set('slack', v)} /></Row>
              <Row title="Daily digest" hint="Summary of alerts and case activity at 8:00"><Toggle label="Daily digest" checked={s.digest} onChange={(v) => set('digest', v)} /></Row>
            </div>
          )}
          {tab === 'thresholds' && (
            <div className="space-y-6">
              {([['high', 'High risk starts at', 'text-red-600'], ['medium', 'Medium risk starts at', 'text-amber-600'], ['autoEscalate', 'Auto-escalate to a case at', 'text-brand-700']] as const).map(([k, label, c]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-slate-700">{label}</span><span className={`font-semibold tabular-nums ${c}`}>{s[k]}</span></div>
                  <input type="range" min={10} max={100} value={s[k]} onChange={(e) => set(k, Number(e.target.value))} className="w-full accent-brand-600" aria-label={label} />
                </div>
              ))}
              {s.medium >= s.high && <p className="text-sm text-red-600">The medium threshold must be lower than the high threshold.</p>}
            </div>
          )}
          {tab === 'prefs' && (
            <div>
              <Row title="Default sort order"><Select className="!w-44" value={s.sort} onChange={(e) => set('sort', e.target.value)}><option>Newest first</option><option>Highest risk first</option></Select></Row>
              <Row title="Auto-assign new cases" hint="Balance by investigator workload"><Toggle label="Auto-assign" checked={s.autoAssign} onChange={(v) => set('autoAssign', v)} /></Row>
              <Row title="Sound for critical alerts"><Toggle label="Sound" checked={s.sound} onChange={(v) => set('sound', v)} /></Row>
            </div>
          )}
          {tab === 'security' && (
            <div>
              <Row title="Two-factor authentication" hint="Require a code at sign-in"><Toggle label="Two-factor authentication" checked={s.mfa} onChange={(v) => set('mfa', v)} /></Row>
              <Row title="Session timeout"><Select className="!w-44" value={s.session} onChange={(e) => set('session', e.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option></Select></Row>
              <Row title="Password" hint="Last changed 42 days ago"><Button size="sm" onClick={() => notify('Password reset email sent', 'info')}>Change password</Button></Row>
            </div>
          )}
          {tab === 'api' && (
            <div className="space-y-4">
              <Field label="API base URL"><input className={inputCls} value={s.apiUrl} onChange={(e) => set('apiUrl', e.target.value)} /></Field>
              <Field label="API key"><div className="flex gap-2"><input className={inputCls} value={s.apiKey} readOnly /><Button onClick={() => { set('apiKey', 'rl_live_••••••••••••' + Math.random().toString(16).slice(2, 6)); notify('API key regenerated', 'info'); }}>Regenerate</Button></div></Field>
              <Row title="Webhook delivery" hint="POST alerts to your endpoint"><Toggle label="Webhook delivery" checked={s.webhook} onChange={(v) => set('webhook', v)} /></Row>
            </div>
          )}
          <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4"><Button variant="primary" onClick={save}>Save changes</Button></div>
        </div>
      </Card>
    </>
  );
}
