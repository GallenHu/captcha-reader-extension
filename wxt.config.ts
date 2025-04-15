import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    manifest_version: 3,
    name: "AI Captcha Reader 验证码识别",
    description: "Identify text CAPTCHA through LLM",
    version: "0.0.1",
    permissions: ["contextMenus", "storage"],
    default_locale: "en",
  },
});
