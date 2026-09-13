import PropTypes from "prop-types";
import ResourceManager from "./ResourceManager";
import {
  caseStudiesConfig,
  navigationConfig,
  pagesConfig,
  partnersConfig,
} from "./resourceConfigs";

// "expertise" and "process-steps" are managed as tabs inside
// ServicesAdminPage.jsx, and "team"/"values" as tabs inside
// TeamAdminPage.jsx — not through this generic resource route.
const CONFIGS = {
  pages: pagesConfig,
  "case-studies": caseStudiesConfig,
  partners: partnersConfig,
  navigation: navigationConfig,
};

export default function AdminResourcePage({ resource }) {
  return <ResourceManager config={CONFIGS[resource]} />;
}

AdminResourcePage.propTypes = {
  resource: PropTypes.oneOf(Object.keys(CONFIGS)).isRequired,
};
