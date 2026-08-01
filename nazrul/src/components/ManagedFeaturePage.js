import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Compass, LayoutDashboard, Sparkles } from "lucide-react";
import { getFeaturePages } from "../lib/bookingStorage";
import "./dashboard.css";

const ManagedFeaturePage = () => {
  const { pageId } = useParams();
  const pages = useMemo(() => getFeaturePages(), []);
  const page =
    pages.find((item) => item.id === pageId) ||
    pages.find((item) => item.path?.endsWith(`/${pageId}`));

  if (!page) {
    return (
      <div className="account-page auth-required">
        <div className="empty-state">
          <Compass size={38} />
          <h2>Page not found</h2>
          <p>This managed feature page does not exist yet. Create it from the Super Admin Studio.</p>
          <Link className="account-button primary" to="/super-admin">
            Go to Super Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page managed-feature-page">
      <div className="account-shell">
        <section className="managed-feature-hero">
          <p className="account-kicker">
            <Sparkles size={16} /> Managed future page
          </p>
          <h1 className="account-title">{page.title}</h1>
          <p className="account-subtitle">{page.description}</p>
          <div className="managed-feature-actions">
            <Link className="account-button primary" to="/super-admin">
              <LayoutDashboard size={17} /> Maintain Page
            </Link>
            <Link className="account-button" to="/dashboard">
              <Compass size={17} /> User App
            </Link>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Status <Sparkles size={18} />
            </div>
            <div className="metric-value" style={{ fontSize: "1.25rem" }}>
              {page.status}
            </div>
            <p className="metric-note">controlled by super admin</p>
          </div>
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Release <CalendarDays size={18} />
            </div>
            <div className="metric-value" style={{ fontSize: "1.25rem" }}>
              {page.releaseWindow}
            </div>
            <p className="metric-note">future roadmap window</p>
          </div>
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Route <Compass size={18} />
            </div>
            <div className="metric-value" style={{ fontSize: "1rem" }}>
              {page.path}
            </div>
            <p className="metric-note">managed app page</p>
          </div>
        </section>

        <section className="account-panel">
          <div className="panel-heading">
            <div>
              <h2>Page maintenance brief</h2>
              <p>This is the placeholder surface for the next feature build.</p>
            </div>
          </div>
          <div className="feature-brief">
            <p>{page.description}</p>
            <p>
              Super admin can keep this page in design, move it into development, mark it ready for review, or set it live from the maintenance studio.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManagedFeaturePage;
