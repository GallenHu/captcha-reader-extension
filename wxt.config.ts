import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    manifest_version: 3,
    name: "AI Captcha Recognition",
    description: "Captcha Recognition by LLM",
    version: "0.0.1",
    permissions: ["contextMenus", "storage"],
    default_locale: "zh_CN",
  },
});
