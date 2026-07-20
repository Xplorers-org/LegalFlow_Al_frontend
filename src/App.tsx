

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/auth';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Payments } from './pages/Payments';
import { Cases } from './pages/Cases';
import { CaseDetails } from './pages/CaseDetails';
import { Documents } from './pages/Documents';
import { DocumentPreview } from './pages/DocumentPreview';
import { TenantDashboard } from './pages/TenantDashboard';
import { TenantLease } from './pages/TenantLease';
import { TenantPayments } from './pages/TenantPayments';
import { TenantHistory } from './pages/TenantHistory';
import { TenantDocuments } from './pages/TenantDocuments';
import { PaymentCheckout } from './pages/PaymentCheckout';
import { TenantDocumentPreview } from './pages/TenantDocumentPreview';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<AppLayout role="landlord" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/:id" element={<CaseDetails />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentPreview />} />
          </Route>

          <Route element={<AppLayout role="tenant" />}>
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/lease" element={<TenantLease />} />
            <Route path="/tenant/payments" element={<TenantPayments />} />
            <Route path="/tenant/pay/:id" element={<PaymentCheckout />} />
            <Route path="/tenant/history" element={<TenantHistory />} />
            <Route path="/tenant/documents" element={<TenantDocuments />} />
            <Route path="/tenant/documents/:id" element={<TenantDocumentPreview />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>);

}