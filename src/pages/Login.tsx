
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollTextIcon, MailIcon, LockIcon, ArrowRightIcon, ShieldCheckIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Field } from '../components/ui/Input';
import { useAuth } from '../lib/auth';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('marlon@delsilvaholdings.lk');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = signIn(email);
      navigate(user.role === 'tenant' ? '/tenant/dashboard' : '/dashboard');
    }, 600);
  };

  return <div className="grid min-h-screen w-full lg:grid-cols-2">
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"><ScrollTextIcon className="h-5 w-5" /></div><span className="text-lg font-semibold">LegalFlow AI</span></div>
      <div className="relative max-w-md"><p className="text-xs font-medium uppercase tracking-widest text-white/60">Commercial Tenancy Compliance</p><h2 className="mt-4 text-3xl font-semibold leading-snug">Automate legal compliance. Keep every decision in your hands.</h2><p className="mt-4 text-sm leading-relaxed text-white/70">A secure workspace for commercial landlords and tenants, connecting every lease, invoice, payment, and document in one trusted flow.</p></div>
      <div className="relative flex items-center gap-2 text-sm text-white/70"><ShieldCheckIcon className="h-4 w-4" />Secure, role-aware access to your workspace</div>
    </div>
    <div className="flex items-center justify-center bg-background px-6 py-12"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-2.5 lg:hidden"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><ScrollTextIcon className="h-5 w-5 text-primary-foreground" /></div><span className="text-lg font-semibold">LegalFlow AI</span></div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1><p className="mt-1.5 text-sm text-muted">Sign in to your compliance workspace.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email address"><div className="relative"><MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input type="email" required placeholder="you@company.lk" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-9" /></div></Field>
        <Field label="Password"><div className="relative"><LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input type={show ? 'text' : 'password'} required placeholder="••••••••" defaultValue="password" className="pl-9 pr-9" /><button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">{show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button></div></Field>
        <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted"><input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30" />Remember me</label><a href="#" className="font-medium text-primary hover:underline">Forgot password?</a></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}{!loading && <ArrowRightIcon className="h-4 w-4" />}</Button>
      </form>
      <div className="mt-6 rounded-lg border border-border bg-surface p-3 text-xs text-muted"><span className="font-medium text-foreground">Prototype access:</span> use <button onClick={() => setEmail('marlon@delsilvaholdings.lk')} className="text-primary hover:underline">Marlon</button> for landlord or <button onClick={() => setEmail('nimal@pereratextiles.lk')} className="text-primary hover:underline">Nimal</button> for tenant.</div>
      <p className="mt-5 text-center text-xs text-muted">Protected workspace. By continuing you agree to the Terms of Service.</p>
    </motion.div></div>
  </div>;
}