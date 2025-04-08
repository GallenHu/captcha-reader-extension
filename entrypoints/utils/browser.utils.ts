import browser from "webextension-polyfill";

export default browser;

export const addMessageListener = browser.runtime.onMessage
  .addListener as typeof chrome.runtime.onMessage.addListener;
