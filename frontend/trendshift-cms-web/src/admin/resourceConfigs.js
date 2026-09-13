// One config object per CMS entity the React admin manages. ResourceManager
// (see ./ResourceManager.jsx) is generic — it renders the list, form,
// reorder and publish/visibility controls purely from this config, so
// adding a new manageable entity later means adding a config here, not a
// new screen. "richtext" fields use RichTextEditor (TipTap) and map to
// CKEditor5Field on the backend; "image" fields upload via
// cmsApi.uploadField as a separate multipart request.

export const expertiseConfig = {
  resource: "expertise",
  idField: "url_key",
  titleField: "title",
  subtitleField: "url_key",
  heading: "Services list",
  description: "Publish and structure the capabilities Trendshift brings to every engagement. These cards power the Services sections on both the Home page and Our Services.",
  newLabel: "New expertise area",
  orderField: "display_order",
  statusFields: [{ name: "is_published", on: "Published", off: "Draft" }, { name: "is_featured", on: "Featured", off: "Standard" }],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "url_key", label: "Slug", type: "text", hint: "Leave blank to auto-generate from the title" },
    { name: "short_description", label: "Short description", type: "richtext", hint: "Shown on summary cards" },
    { name: "description", label: "Full description", type: "richtext" },
    { name: "capabilities", label: "Capabilities", type: "capabilities", hint: "One capability per line" },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_published", label: "Published", type: "checkbox" },
    { name: "is_featured", label: "Featured", type: "checkbox" },
    { name: "meta_title", label: "Meta title", type: "text" },
    { name: "meta_description", label: "Meta description", type: "textarea" },
    { name: "og_image", label: "Open Graph image", type: "image" },
  ],
};

// The Services page's own banner/overview copy is also editable from the
// "Page content" tab under the Services admin section (see
// ServicesAdminPage.jsx), which uses this trimmed field list — no url_key
// or enabled toggle there, since changing those from inside that tab risks
// breaking the /services route unexpectedly.
export const servicesPageContentFields = [
  { name: "title", label: "Title", type: "text" },
  { name: "short_description", label: "Short description", type: "richtext", hint: "The page's banner subheading" },
  { name: "description", label: "Full description", type: "richtext", hint: "Shown as the Overview section on the Our Services page" },
  { name: "meta_title", label: "Meta title", type: "text" },
  { name: "meta_description", label: "Meta description", type: "textarea" },
  { name: "og_image", label: "Open Graph image", type: "image" },
];

export const pagesConfig = {
  resource: "pages",
  idField: "url_key",
  titleField: "title",
  subtitleField: "url_key",
  heading: "Website pages",
  description:
    "Manage each page's banner heading, intro copy and search metadata. Card content shown on these pages — Expertise areas, Case studies, Team, Values, Partners — is managed in its own section below, since the same cards are reused across multiple pages.",
  newLabel: "New page",
  statusFields: [{ name: "is_enabled", on: "Enabled", off: "Disabled" }],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "url_key", label: "Slug", type: "text", hint: "Leave blank to auto-generate from the title" },
    { name: "short_description", label: "Short description", type: "richtext", hint: "The page's banner subheading" },
    {
      name: "description",
      label: "Full description",
      type: "richtext",
      hint: "This page's intro text only — card content below it (Expertise areas, Case studies) is managed in its own section",
    },
    { name: "is_enabled", label: "Enabled", type: "checkbox" },
    { name: "meta_title", label: "Meta title", type: "text" },
    { name: "meta_description", label: "Meta description", type: "textarea" },
    { name: "og_image", label: "Open Graph image", type: "image" },
  ],
};

export const caseStudiesConfig = {
  resource: "case-studies",
  idField: "url_key",
  titleField: "title",
  subtitleField: "url_key",
  heading: "Case studies",
  description: "Manage the client engagement cards shown in \"Featured work\" on both the Home page and the Case Studies page — including each card's image.",
  newLabel: "New case study",
  statusFields: [{ name: "is_enabled", on: "Enabled", off: "Disabled" }],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "url_key", label: "Slug", type: "text", hint: "Leave blank to auto-generate from the title" },
    { name: "short_description", label: "Short description", type: "richtext" },
    { name: "description", label: "Full description", type: "richtext" },
    { name: "challenge", label: "The challenge", type: "richtext", hint: "Shown in the \"Challenge, approach & outcome\" section on this case study's detail page." },
    { name: "approach", label: "Our approach", type: "richtext" },
    { name: "outcome", label: "The outcome", type: "richtext" },
    { name: "is_enabled", label: "Enabled", type: "checkbox" },
    { name: "meta_title", label: "Meta title", type: "text" },
    { name: "meta_description", label: "Meta description", type: "textarea" },
    { name: "image", label: "Card image", type: "image" },
    { name: "og_image", label: "Open Graph image", type: "image" },
  ],
};

export const teamConfig = {
  resource: "team",
  idField: "id",
  titleField: "name",
  subtitleField: "role",
  heading: "Team members",
  description: "Manage the team member cards shown on the Home page and the About page.",
  newLabel: "New team member",
  orderField: "display_order",
  statusFields: [{ name: "is_visible", on: "Visible", off: "Hidden" }],
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "role", label: "Role", type: "text" },
    { name: "photo", label: "Photo", type: "image" },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_visible", label: "Visible", type: "checkbox" },
  ],
};

export const valuesConfig = {
  resource: "values",
  idField: "id",
  titleField: "title",
  heading: "Mission, vision & values",
  description: "Manage the three value cards shown on the About page.",
  newLabel: "New value card",
  orderField: "display_order",
  statusFields: [{ name: "is_visible", on: "Visible", off: "Hidden" }],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_visible", label: "Visible", type: "checkbox" },
  ],
};

export const processStepsConfig = {
  resource: "process-steps",
  idField: "id",
  titleField: "title",
  heading: "How we work",
  description: "Manage the process steps shown on the Our Services page.",
  newLabel: "New step",
  orderField: "display_order",
  statusFields: [{ name: "is_visible", on: "Visible", off: "Hidden" }],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_visible", label: "Visible", type: "checkbox" },
  ],
};

export const partnersConfig = {
  resource: "partners",
  idField: "id",
  titleField: "name",
  heading: "Partner logos",
  description: "Manage the partner logo grid shown on the Home page and the Partners page.",
  newLabel: "New partner",
  orderField: "display_order",
  statusFields: [{ name: "is_visible", on: "Visible", off: "Hidden" }],
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "logo", label: "Logo", type: "image" },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_visible", label: "Visible", type: "checkbox" },
  ],
};

export const navigationConfig = {
  resource: "navigation",
  idField: "id",
  titleField: "label",
  subtitleField: "url",
  heading: "Navigation",
  description: "Control the links, order, visibility and menu placement (header, footer, or both) across the public site.",
  newLabel: "New menu item",
  orderField: "display_order",
  statusFields: [{ name: "is_visible", on: "Visible", off: "Hidden" }],
  fields: [
    { name: "label", label: "Label", type: "text", required: true },
    { name: "url", label: "URL", type: "text", required: true, hint: "e.g. /services or https://example.com" },
    {
      name: "placement",
      label: "Shown in",
      type: "select",
      options: [
        { value: "header", label: "Header only" },
        { value: "footer", label: "Footer only" },
        { value: "both", label: "Header & footer" },
      ],
    },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_visible", label: "Visible", type: "checkbox" },
    { name: "open_in_new_tab", label: "Open in new tab", type: "checkbox" },
  ],
};
