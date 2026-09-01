'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  LogOut,
  Download,
  Copy,
  Check,
  Trash2,
  Search,
  RefreshCw,
  Mail,
  ExternalLink,
  Users,
  Calendar,
  Send,
  Eye,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, emailsSent: 0 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Modals
  const [previewEmailModal, setPreviewEmailModal] = useState(false);
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState(null); // { success, message }
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchSubscribers = useCallback(async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers?search=${encodeURIComponent(query)}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
        if (data.stats) setStats(data.stats);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        fetchSubscribers();
      } else {
        setLoginError(data.error || 'Invalid administrator password.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) return;

    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      } else {
        alert(data.error || 'Failed to delete subscriber');
      }
    } catch {
      alert('Network error while deleting');
    }
  };

  const handleCopyOne = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (subscribers.length === 0) return;
    const allEmails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(allEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailInput) return;

    setIsSendingTest(true);
    setTestEmailStatus(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailInput }),
      });
      const data = await res.json();
      setTestEmailStatus({
        success: data.success,
        message: data.message || (data.success ? 'Email sent successfully!' : data.error),
      });
    } catch {
      setTestEmailStatus({
        success: false,
        message: 'Failed to dispatch test email. Check server logs.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#120f0d] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#b3653b]" />
          <span className="text-xs tracking-widest text-white/70 uppercase">Loading Console...</span>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e0c0b] text-[#f4ece1] flex flex-col justify-center items-center px-4 relative selection:bg-[#b3653b]">
        {/* Background glow */}
        <div className="absolute w-96 h-96 bg-[#b3653b]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#1a1614] border border-[#3d332e] rounded-sm p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#b3653b]/20 border border-[#b3653b]/40 flex items-center justify-center text-[#d4af37]">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl tracking-[0.2em] font-normal text-white uppercase mb-1">
              CHUNNIINDIA
            </h1>
            <p className="text-xs tracking-widest text-[#a8998d] uppercase">
              Admin & Subscriber Console
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-[#c4b5a8] mb-2">
                Administrator Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                required
                className="w-full h-11 px-3.5 bg-[#120f0d] text-white placeholder-white/30 text-sm border border-[#3d332e] focus:border-[#b3653b] focus:outline-none transition-colors rounded-none"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/40 p-3 rounded-none border border-red-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-11 bg-[#b3653b] hover:bg-[#c87a50] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2e2622] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs tracking-widest text-[#a8998d] hover:text-white transition-colors"
            >
              <span>← Back to Coming Soon Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0e0c0b] text-[#f4ece1] flex flex-col font-sans selection:bg-[#b3653b]">
      {/* Top Navbar */}
      <nav className="border-b border-[#2e2622] bg-[#161210]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-cinzel text-lg sm:text-xl tracking-[0.2em] text-white hover:text-[#e8a87c] transition-colors">
              CHUNNIINDIA
            </Link>
            <span className="text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#b3653b]/20 text-[#e8a87c] border border-[#b3653b]/40 uppercase font-medium">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs tracking-wider text-[#a8998d] hover:text-white transition-colors px-3 py-1.5 border border-[#3d332e] hover:border-white/40"
            >
              <span>View Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs tracking-wider text-red-300 hover:text-red-200 px-3 py-1.5 border border-red-900/40 hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1614] border border-[#2e2622] p-5 rounded-none shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[#a8998d] uppercase">
                  Total Subscribers
                </p>
                <h3 className="font-cinzel text-3xl text-white font-normal mt-1">
                  {stats.total}
                </h3>
              </div>
              <div className="p-3 bg-[#b3653b]/15 text-[#e8a87c] rounded-full">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-[#8e7e72]">
              Patrons registered on exclusive launch list
            </div>
          </div>

          <div className="bg-[#1a1614] border border-[#2e2622] p-5 rounded-none shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[#a8998d] uppercase">
                  Today&apos;s Signups
                </p>
                <h3 className="font-cinzel text-3xl text-[#d4af37] font-normal mt-1">
                  {stats.today}
                </h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-[#d4af37] rounded-full">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-[#8e7e72]">
              New subscriptions logged today
            </div>
          </div>

          <div className="bg-[#1a1614] border border-[#2e2622] p-5 rounded-none shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[#a8998d] uppercase">
                  Welcome Emails Sent
                </p>
                <h3 className="font-cinzel text-3xl text-emerald-400 font-normal mt-1">
                  {stats.emailsSent}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-[#8e7e72]">
              Automated notifications delivered / simulated
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-[#1a1614] border border-[#2e2622] p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e7e72]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchSubscribers(e.target.value);
              }}
              placeholder="Search subscribers by email..."
              className="w-full h-10 pl-9 pr-4 bg-[#120f0d] text-white placeholder-white/30 text-xs tracking-wider border border-[#3d332e] focus:border-[#b3653b] focus:outline-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export CSV */}
            <a
              href="/api/admin/export"
              download
              className="flex items-center gap-1.5 px-4 h-10 bg-[#b3653b] hover:bg-[#c87a50] text-white text-xs font-medium tracking-widest uppercase transition-colors shadow-sm"
              title="Download full CSV of all subscribers"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            {/* Copy All Emails */}
            <button
              onClick={handleCopyAll}
              disabled={subscribers.length === 0}
              className="flex items-center gap-1.5 px-3.5 h-10 bg-[#251e1b] hover:bg-[#342b27] border border-[#3d332e] text-[#f4ece1] text-xs font-medium tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer"
              title="Copy all subscriber emails formatted for mailing lists"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
            </button>

            {/* Email Preview */}
            <button
              onClick={() => setPreviewEmailModal(true)}
              className="flex items-center gap-1.5 px-3.5 h-10 bg-[#251e1b] hover:bg-[#342b27] border border-[#3d332e] text-[#f4ece1] text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer"
              title="View the automated welcome email sent to subscribers"
            >
              <Eye className="w-3.5 h-3.5 text-[#e8a87c]" />
              <span className="hidden sm:inline">Preview Email</span>
            </button>

            {/* Test Send */}
            <button
              onClick={() => {
                setTestEmailModal(true);
                setTestEmailStatus(null);
              }}
              className="flex items-center gap-1.5 px-3.5 h-10 bg-[#251e1b] hover:bg-[#342b27] border border-[#3d332e] text-[#f4ece1] text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer"
              title="Test SMTP email delivery"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Send Test</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchSubscribers(search)}
              className="p-2.5 h-10 bg-[#251e1b] hover:bg-[#342b27] border border-[#3d332e] text-[#a8998d] hover:text-white transition-colors cursor-pointer"
              title="Refresh subscriber list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-[#1a1614] border border-[#2e2622] rounded-none overflow-hidden shadow-md">
          <div className="px-5 py-4 border-b border-[#2e2622] flex items-center justify-between">
            <h2 className="font-cinzel text-base tracking-widest text-white uppercase">
              Subscribers Roster ({subscribers.length})
            </h2>
            <span className="text-xs text-[#a8998d]">
              Live updates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2e2622] bg-[#120f0d] text-[#a8998d] tracking-widest uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-medium">#</th>
                  <th className="py-3.5 px-4 font-medium">Email Address</th>
                  <th className="py-3.5 px-4 font-medium">Subscribed Date</th>
                  <th className="py-3.5 px-4 font-medium">Time</th>
                  <th className="py-3.5 px-4 font-medium">Email Notification</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#261f1c]">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8e7e72]">
                      {search ? 'No subscribers match your search term.' : 'No subscribers recorded yet. Sign up on the main page!'}
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub, index) => (
                    <tr
                      key={sub.id || index}
                      className="hover:bg-[#221c19] transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-[#8e7e72]">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono text-sm text-white font-normal">
                        {sub.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#c4b5a8]">
                        {sub.formattedDate || (sub.createdAt ? sub.createdAt.slice(0, 10) : '—')}
                      </td>
                      <td className="py-3.5 px-4 text-[#8e7e72]">
                        {sub.formattedTime || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.emailSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                            Queued / Simulated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy single email */}
                          <button
                            onClick={() => handleCopyOne(sub.email, sub.id)}
                            className="p-1.5 text-[#a8998d] hover:text-white hover:bg-[#342b27] transition-colors"
                            title="Copy email to clipboard"
                          >
                            {copiedId === sub.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete subscriber */}
                          <button
                            onClick={() => handleDelete(sub.id, sub.email)}
                            className="p-1.5 text-[#a8998d] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Guide Banner */}
        <div className="mt-8 bg-[#161210] border border-[#2e2622] p-5 text-xs text-[#a8998d] leading-relaxed">
          <div className="flex items-center gap-2 text-white font-medium mb-1">
            <Sparkles className="w-4 h-4 text-[#e8a87c]" />
            <span className="tracking-wider uppercase text-[11px]">Email Delivery Setup Note</span>
          </div>
          <p>
            Subscribers are stored persistently in <code className="text-[#e8a87c] bg-black/40 px-1 py-0.5">data/subscribers.json</code>.
            To connect live Gmail / Resend SMTP email delivery, simply fill in <code className="text-[#e8a87c] bg-black/40 px-1 py-0.5">SMTP_HOST</code>, <code className="text-[#e8a87c] bg-black/40 px-1 py-0.5">SMTP_USER</code>, and <code className="text-[#e8a87c] bg-black/40 px-1 py-0.5">SMTP_PASS</code> in <code className="text-[#e8a87c] bg-black/40 px-1 py-0.5">.env.local</code>.
          </p>
        </div>

      </main>

      {/* Email Preview Modal */}
      {previewEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1a1614] border border-[#3d332e] w-full max-w-2xl max-h-[90vh] flex flex-col rounded-none shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2e2622] flex items-center justify-between bg-[#120f0d]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#e8a87c]" />
                <h3 className="font-cinzel text-sm tracking-widest text-white uppercase">
                  Welcome Email Template Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewEmailModal(false)}
                className="text-[#a8998d] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-[#14100e]">
              <iframe
                src="/api/admin/test-email"
                title="Email Preview"
                className="w-full h-[520px] bg-transparent border border-[#2e2622]"
              />
            </div>
            <div className="px-5 py-3 border-t border-[#2e2622] bg-[#120f0d] flex justify-end">
              <button
                onClick={() => setPreviewEmailModal(false)}
                className="px-4 py-2 bg-[#2e2622] hover:bg-[#3d332e] text-white text-xs tracking-wider uppercase transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1a1614] border border-[#3d332e] w-full max-w-md p-6 rounded-none shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel text-sm tracking-widest text-white uppercase">
                  Send Test Welcome Email
                </h3>
              </div>
              <button
                onClick={() => setTestEmailModal(false)}
                className="text-[#a8998d] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#a8998d] mb-4">
              Send a simulated or live welcome email to test delivery format and styling.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-[#c4b5a8] mb-1.5">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="w-full h-10 px-3 bg-[#120f0d] text-white placeholder-white/30 text-xs border border-[#3d332e] focus:border-[#b3653b] focus:outline-none transition-colors"
                />
              </div>

              {testEmailStatus && (
                <div
                  className={`p-3 text-xs flex items-center gap-2 ${
                    testEmailStatus.success
                      ? 'bg-emerald-950/50 border border-emerald-800/40 text-emerald-200'
                      : 'bg-red-950/50 border border-red-800/40 text-red-200'
                  }`}
                >
                  {testEmailStatus.success ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{testEmailStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestEmailModal(false)}
                  className="px-4 py-2 bg-[#2e2622] hover:bg-[#3d332e] text-white text-xs tracking-wider uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-4 py-2 bg-[#b3653b] hover:bg-[#c87a50] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
