import browser, { addMessageListener } from "./utils/browser.utils";
import { MESSAGE_ACTION } from "./constants/message";
import { predict } from "./utils/llm.utils";
import { sleep } from "./utils/utitls";
import { getStorage } from "./utils/storage.utils";
import { STORAGE_KEY } from "./constants/storage";

browser.runtime.onInstalled.addListener(function () {
  const contexts: chrome.contextMenus.ContextType[] = [
    // "page",
    // "link",
    "image",
  ];

  for (let i = 0; i < contexts.length; i++) {
    let context = contexts[i];
    let title = `Analyze the ${context}`;
    browser.contextMenus.create({
      title: title,
      contexts: [context],
      id: context,
    });
  }
});

export default defineBackground(() => {
  browser.contextMenus.onClicked.addListener(genericOnClick);

  addMessageListener((request, sender, sendResponse) => {
    switch (request.action) {
      default:
        break;
    }
  });
});

// A generic onclick callback function.
async function genericOnClick(
  info: browser.Menus.OnClickData,
  tab: browser.Tabs.Tab | undefined
) {
  if (info.mediaType === "image") {
    if (!(await checkConfigure())) {
      await openPopup();
      await sleep(10);
      showErr(chrome.i18n.getMessage("configureRequired"));
      return;
    }

    if (tab?.id) {
      browser.tabs
        .sendMessage(tab.id, {
          action: MESSAGE_ACTION.GET_IMAGE_INFO,
          imageUrl: info.srcUrl,
        })
        .then((response) => {
          if (typeof response === "string") {
            handleReceivedBase64Image(response);
          } else {
            showErr("Failed to get image base64:" + String(response));
          }
        })
        .catch(() => {
          if (browser.runtime.lastError) {
            console.error("发送消息错误:", browser.runtime.lastError.message);
            return;
          }
        });
    } else {
      showErr("Failed to get tab id" + String(tab));
    }
  }
}

async function handleReceivedBase64Image(dataUrl: string) {
  await openPopup();

  await sleep(10);

  browser.runtime.sendMessage({
    action: MESSAGE_ACTION.START_LOADING,
  });

  const results = await handleInvoke(dataUrl);

  browser.runtime.sendMessage({
    action: MESSAGE_ACTION.STOP_LOADING,
  });

  if (results) {
    browser.runtime.sendMessage({
      action: MESSAGE_ACTION.SHOW_PREDICTED,
      data: results,
    });
  }
}

async function handleInvoke(dataUrl: string) {
  const res = await predict(dataUrl.replace(/^data:image\/[^;]+;base64,/, ""));

  if (res) {
    let arr: string[] = [];
    try {
      const obj = JSON.parse(res);
      arr = obj["texts"];
    } catch (err) {
      if (typeof res === "string") {
        if (res.includes("\n")) {
          arr = res.split("\n");
        } else if (res.includes("\r\n")) {
          arr = res.split("\r\n");
        } else if (res.includes("\r")) {
          arr = res.split("\r");
        } else {
          arr = [res];
        }
      } else {
        arr = [];
      }
    }

    return arr;
  } else {
    showErr("Failed to get prediction.");
  }
}

async function checkConfigure() {
  const model = await getStorage(STORAGE_KEY.MODEL);
  const apiKey = await getStorage(STORAGE_KEY.API_KEY);
  const baseUrl = await getStorage(STORAGE_KEY.BASE_URL);

  return model && apiKey && baseUrl;
}

async function openPopup() {
  // https://github.com/karakeep-app/karakeep/blob/817eb58832a3e715e21892417b7624f4b1cf0d46/apps/browser-extension/src/background/background.ts#L77C13-L77C39
  await browser.action.openPopup();
}

function showErr(msg: string) {
  browser.runtime.sendMessage({
    action: MESSAGE_ACTION.SHOW_ERROR,
    data: msg,
  });
}
