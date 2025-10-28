import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { ClientModule } from "@docusaurus/types";

const module: ClientModule = {
  onRouteDidUpdate({ location, previousLocation }) {
    if (ExecutionEnvironment.canUseDOM) {
      if (location.pathname != previousLocation?.pathname) {
        setTimeout(() => {
          // Check if _paq is available (Matomo is loaded)
          if (typeof window._paq !== "undefined") {
            if (previousLocation) {
              window._paq.push(["setReferrerUrl", previousLocation.pathname]);
            }
            window._paq.push(["setCustomUrl", location.pathname]);
            window._paq.push(["setDocumentTitle", document.title]);
            window._paq.push(["trackPageView"]);
          }
        });
      }
    }
  },
};

export default module;
