import browser, { addMessageListener } from "./utils/browser.utils";
import { MESSAGE_ACTION } from "./constants/message";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  browser.contextMenus.onClicked.addListener(genericOnClick);

  addMessageListener((request, sender, sendResponse) => {
    switch (request.action) {
      case MESSAGE_ACTION.PREDICTED:
        handlePredicted(request.data);
        break;
      case MESSAGE_ACTION.OPEN_POPUP:
        handleOpenPopup(() => {
          setTimeout(() => {
            browser.runtime.sendMessage({
              action: MESSAGE_ACTION.START_LOADING,
            });
          }, 10);
        });
        break;

      default:
        break;
    }
  });
});

// A generic onclick callback function.
function genericOnClick(
  info: browser.Menus.OnClickData,
  tab: browser.Tabs.Tab | undefined
) {
  console.log("bg: genericOnClick", info.mediaType, tab?.id);

  if (info.mediaType === "image") {
    if (tab?.id) {
      browser.tabs
        .sendMessage(tab.id, {
          action: MESSAGE_ACTION.GET_IMAGE_INFO,
          imageUrl: info.srcUrl,
        })
        .then((response) => {
          console.log("收到图片信息:", response);
        })
        .catch(() => {
          if (browser.runtime.lastError) {
            console.log("发送消息错误:", browser.runtime.lastError.message);
            return;
          }
        });
    }
  }
}

browser.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  const contexts: chrome.contextMenus.ContextType[] = [
    // "page",
    // "link",
    "image",
  ];
  for (let i = 0; i < contexts.length; i++) {
    let context = contexts[i];
    let title = "Test '" + context + "' menu item";
    browser.contextMenus.create({
      title: title,
      contexts: [context],
      id: context,
    });
  }

  // Create a parent item and two children.
  let parent = browser.contextMenus.create({
    title: "Test parent item",
    id: "parent",
  });
});

async function handleOpenPopup(callback: () => void) {
  try {
    // https://github.com/karakeep-app/karakeep/blob/817eb58832a3e715e21892417b7624f4b1cf0d46/apps/browser-extension/src/background/background.ts#L77C13-L77C39
    await browser.action.openPopup();
  } catch (error) {
    // ...
  }

  callback();
}

function handlePredicted(data: string[]) {
  browser.runtime.sendMessage({
    action: MESSAGE_ACTION.STOP_LOADING,
  });
}
