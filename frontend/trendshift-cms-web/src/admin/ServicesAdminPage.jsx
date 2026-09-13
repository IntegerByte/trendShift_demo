import { useSearchParams } from "react-router-dom";
import ResourceManager from "./ResourceManager";
import PageContentEditor from "./PageContentEditor";
import { expertiseConfig, processStepsConfig, servicesPageContentFields } from "./resourceConfigs";

// Everything editorially tied to the public Our Services page, grouped
// under one sidebar entry with tabs instead of three separate top-level
// menu items — the services list, the page's own banner/overview copy, and
// the "How we work" steps are all part of the same page, so they're
// managed together here.
const TABS = [
  { key: "list", label: "Services" },
  { key: "content", label: "Page Content" },
  { key: "how-we-work", label: "How We Work" },
];

export default function ServicesAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some((tab) => tab.key === searchParams.get("tab")) ? searchParams.get("tab") : "list";

  return (
    <section>
      <div className="cms-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "is-active" : undefined}
            onClick={() => setSearchParams(tab.key === "list" ? {} : { tab: tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && <ResourceManager config={expertiseConfig} />}

      {activeTab === "content" && (
        <PageContentEditor
          resource="pages"
          pageId="services"
          heading="Our Services page content"
          description="The banner heading/subheading and the Overview section shown at the top of the Our Services page."
          fields={servicesPageContentFields}
        />
      )}

      {activeTab === "how-we-work" && <ResourceManager config={processStepsConfig} />}
    </section>
  );
}
