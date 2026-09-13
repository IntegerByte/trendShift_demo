import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "../components/layout/RootLayout";
import RouteError from "./RouteError";

// The public pages are NOT code-split. Combined they're tiny (a few tens
// of KB gzipped — smaller than the vendor chunk already being downloaded),
// so splitting them bought negligible initial-load savings but cost a
// visible blank Suspense gap on every first navigation to a page whose
// chunk hadn't loaded yet — on top of the page's own data fetch, that
// looked like the whole app reloading. Bundling them normally means the
// page component itself is always instantly available; only the CMS data
// fetch (already cached/prefetched in most cases — see app/prefetch.js)
// is ever actually "loading".
import HomePage from "../pages/HomePage";
import ServicesPage from "../pages/ServicesPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import CaseStudiesPage from "../pages/CaseStudiesPage";
import CaseStudyDetailPage from "../pages/CaseStudyDetailPage";
import AboutPage from "../pages/AboutPage";
import TeamPage from "../pages/TeamPage";
import PartnersPage from "../pages/PartnersPage";
import ContactPage from "../pages/ContactPage";
import TermsPage from "../pages/TermsPage";
import NotFoundPage from "../pages/NotFoundPage";

// Admin app — genuinely large (TipTap, etc.) and only ever needed by
// signed-in staff, so it stays a separate chunk, only loaded when a
// visitor actually goes to /admin.
const AdminLogin = lazy(() => import("../admin/AdminLogin"));
const AdminLayout = lazy(() => import("../admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));
const AdminResourcePage = lazy(() => import("../admin/AdminResourcePage"));
const ServicesAdminPage = lazy(() => import("../admin/ServicesAdminPage"));
const TeamAdminPage = lazy(() => import("../admin/TeamAdminPage"));
const ContactSubmissionsPage = lazy(() => import("../admin/ContactSubmissionsPage"));
const AdminUsersPage = lazy(() => import("../admin/AdminUsersPage"));
const SiteSettingsPage = lazy(() => import("../admin/SiteSettingsPage"));

function withSuspense(Page) {
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: "/admin/login", element: withSuspense(AdminLogin), errorElement: <RouteError /> },
  {
    path: "/admin",
    element: withSuspense(AdminLayout),
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: "services", element: withSuspense(ServicesAdminPage) },
      // Old bookmarks/links — redirect rather than 404, since "Expertise"
      // and "How we work" are now tabs inside the Services section.
      { path: "expertise", element: <Navigate to="/admin/services" replace /> },
      { path: "process-steps", element: <Navigate to="/admin/services?tab=how-we-work" replace /> },
      { path: "pages", element: withSuspense(() => <AdminResourcePage resource="pages" />) },
      { path: "case-studies", element: withSuspense(() => <AdminResourcePage resource="case-studies" />) },
      { path: "team", element: withSuspense(TeamAdminPage) },
      // Old bookmark — "Values" is now a tab inside the Team section.
      { path: "values", element: <Navigate to="/admin/team?tab=values" replace /> },
      { path: "partners", element: withSuspense(() => <AdminResourcePage resource="partners" />) },
      { path: "navigation", element: withSuspense(() => <AdminResourcePage resource="navigation" />) },
      { path: "contact-submissions", element: withSuspense(ContactSubmissionsPage) },
      { path: "users", element: withSuspense(AdminUsersPage) },
      { path: "settings", element: withSuspense(SiteSettingsPage) },
    ],
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "services/:slug", element: <ServiceDetailPage /> },
      { path: "case-studies", element: <CaseStudiesPage /> },
      { path: "case-studies/:slug", element: <CaseStudyDetailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
