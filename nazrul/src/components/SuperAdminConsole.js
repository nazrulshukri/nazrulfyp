import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Compass,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  canAccessSuperAdmin,
  getCurrentUserEmail,
  getCurrentUserRole,
  getFeaturePages,
  saveFeaturePage,
  updateFeaturePageStatus,
  USER_ROLES,
} from "../lib/bookingStorage";
import "./dashboard.css";

const emptyPage = {
  title: "",
  path: "",
  status: "In design",
  releaseWindow: "Q4 2026",
  description: "",
};

const systemModules = [
  {
    title: "User booking",
    label: "Traveller flow",
    description: "Search, book, pay, apply vouchers, and track upcoming trips.",
    icon: Compass,
  },
  {
    title: "Admin operations",
    label: "Voucher and monitor",
    description: "Admins monitor confirmed bookings and maintain voucher campaigns.",
    icon: LayoutDashboard,
  },
  {
    title: "Super admin studio",
    label: "Future app control",
    description: "Super admins add new pages, plan releases, and maintain feature status.",
    icon: Sparkles,
  },
];

const SuperAdminConsole = () => {
  const email = getCurrentUserEmail();
  const role = getCurrentUserRole();
  const [pages, setPages] = useState(() => getFeaturePages());
  const [pageDraft, setPageDraft] = useState(emptyPage);
  const [savedMessage, setSavedMessage] = useState("");

  if (!email) {
    return (
      <div className="account-page auth-required">
        <div className="empty-state">
          <LockKeyhole size={38} />
          <h2>Super admin login required</h2>
          <p>Sign in with a super admin account to maintain future features and app pages.</p>
          <Link className="account-button primary" to="/signin">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessSuperAdmin(role)) {
    return (
      <div className="account-page auth-required">
        <div className="empty-state">
          <ShieldCheck size={38} />
          <h2>Super admin access only</h2>
          <p>Admin users can manage bookings and vouchers. Only super admin users can maintain future app features.</p>
          <Link className="account-button primary" to="/admin">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  const updateDraft = (field, value) => {
    setSavedMessage("");
    setPageDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const savedPage = saveFeaturePage({
      ...pageDraft,
      ownerRole: USER_ROLES.SUPER_ADMIN,
    });
    setPages(getFeaturePages());
    setPageDraft(emptyPage);
    setSavedMessage(`${savedPage.title} has been added to the future app roadmap.`);
  };

  const handleStatus = (id, status) => {
    setPages(updateFeaturePageStatus(id, status));
  };

  return (
    <div className="account-page super-admin-page">
      <div className="account-shell">
        <div className="account-topbar admin-hero">
          <div>
            <p className="account-kicker">
              <Sparkles size={16} /> Super admin studio
            </p>
            <h1 className="account-title">Future App Maintenance</h1>
            <p className="account-subtitle">
              Maintain the 2026 platform roadmap, create new app pages, and keep feature launches organised before they go live.
            </p>
          </div>
          <div className="account-actions">
            <Link className="account-button" to="/admin">
              <LayoutDashboard size={17} /> Admin Ops
            </Link>
            <Link className="account-button primary" to="/dashboard">
              <Compass size={17} /> User App
            </Link>
          </div>
        </div>

        <section className="super-architecture">
          {systemModules.map((module) => {
            const Icon = module.icon;
            return (
              <article className="architecture-card" key={module.title}>
                <span className="architecture-icon">
                  <Icon size={22} />
                </span>
                <p>{module.label}</p>
                <h2>{module.title}</h2>
                <span>{module.description}</span>
              </article>
            );
          })}
        </section>

        <div className="admin-layout">
          <section className="account-panel">
            <div className="panel-heading">
              <div>
                <h2>Add new page</h2>
                <p>Create a managed route for future features, operations, campaigns, or internal tools.</p>
              </div>
            </div>

            <form className="maintenance-form feature-form" onSubmit={handleSubmit}>
              <div className="maintenance-field">
                <label>Page title</label>
                <input
                  value={pageDraft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="AI Travel Concierge"
                  required
                />
              </div>
              <div className="maintenance-field">
                <label>Route path</label>
                <input
                  value={pageDraft.path}
                  onChange={(event) => updateDraft("path", event.target.value)}
                  placeholder="/feature-lab/ai-travel-concierge"
                />
              </div>
              <div className="maintenance-field">
                <label>Status</label>
                <select value={pageDraft.status} onChange={(event) => updateDraft("status", event.target.value)}>
                  <option value="In design">In design</option>
                  <option value="In development">In development</option>
                  <option value="Ready for review">Ready for review</option>
                  <option value="Live">Live</option>
                </select>
              </div>
              <div className="maintenance-field">
                <label>Release window</label>
                <input
                  value={pageDraft.releaseWindow}
                  onChange={(event) => updateDraft("releaseWindow", event.target.value)}
                  placeholder="Q4 2026"
                />
              </div>
              <div className="maintenance-field full">
                <label>Feature notes</label>
                <textarea
                  value={pageDraft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  placeholder="Describe what this page will maintain, who owns it, and why it matters."
                  required
                />
              </div>
              {savedMessage && <div className="form-success">{savedMessage}</div>}
              <div className="maintenance-field full">
                <button className="account-button primary" type="submit">
                  <Save size={17} /> Add Future Page
                </button>
              </div>
            </form>
          </section>

          <aside className="admin-side-stack">
            <section className="account-panel">
              <div className="panel-heading">
                <div>
                  <h2>Roadmap pages</h2>
                  <p>Super admin maintained pages and feature plans.</p>
                </div>
              </div>

              <div className="feature-page-list">
                {pages.map((page) => (
                  <article className="feature-page-card" key={page.id}>
                    <div className="feature-page-main">
                      <span className="architecture-icon small">
                        <Boxes size={18} />
                      </span>
                      <div>
                        <h3>{page.title}</h3>
                        <p>{page.description}</p>
                      </div>
                    </div>
                    <div className="feature-page-meta">
                      <span className="status-chip good">{page.status}</span>
                      <span>{page.releaseWindow}</span>
                    </div>
                    <div className="feature-page-actions">
                      <Link className="account-button" to={page.path}>
                        <Plus size={16} /> Open Page
                      </Link>
                      <select value={page.status} onChange={(event) => handleStatus(page.id, event.target.value)}>
                        <option value="In design">In design</option>
                        <option value="In development">In development</option>
                        <option value="Ready for review">Ready for review</option>
                        <option value="Live">Live</option>
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="account-panel super-system-card">
              <div className="panel-heading">
                <div>
                  <h2>Maintenance rules</h2>
                  <p>Keep every new page controlled and reviewable.</p>
                </div>
              </div>
              <div className="profile-detail-list">
                <div className="profile-detail">
                  <span className="field-icon">
                    <Settings size={18} />
                  </span>
                  <div>
                    <span>Ownership</span>
                    <strong>Super admin approves new pages</strong>
                  </div>
                </div>
                <div className="profile-detail">
                  <span className="field-icon">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <span>Access</span>
                    <strong>Admin and user flows stay separated</strong>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminConsole;
