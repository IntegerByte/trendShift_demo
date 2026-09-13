import { useSearchParams } from "react-router-dom";
import ResourceManager from "./ResourceManager";
import { teamConfig, valuesConfig } from "./resourceConfigs";

// Team members and Mission/Vision/Values are both shown on the About page,
// so — same pattern as ServicesAdminPage — they're grouped under one
// sidebar entry with tabs instead of two separate top-level menu items.
const TABS = [
  { key: "list", label: "Team" },
  { key: "values", label: "Values" },
];

export default function TeamAdminPage() {
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

      {activeTab === "list" && <ResourceManager config={teamConfig} />}

      {activeTab === "values" && <ResourceManager config={valuesConfig} />}
    </section>
  );
}
