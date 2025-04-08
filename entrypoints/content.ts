import browser, { addMessageListener } from "./utils/browser.utils";
import { predict } from "./utils/genai.utils";
import { getBase64 } from "./utils/image.utils";
import { MESSAGE_ACTION } from "./constants/message";

export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log("Hello content.");

    start();
  },
});

function start() {
  // 监听来自背景脚本的消息
  addMessageListener((request, sender, sendResponse) => {
    console.log("receive message", request);

    if (request.action === MESSAGE_ACTION.GET_IMAGE_INFO) {
      let element: HTMLImageElement | null = null;

      // 通过URL查找对应的图片元素
      let images: NodeListOf<HTMLImageElement> = document.querySelectorAll(
        `img[src="${request.imageUrl}"]`
      );
      if (images.length === 0) {
        images = document.querySelectorAll(`img[src]`);

        for (const image of images) {
          if (image.src === request.imageUrl) {
            element = image;
            break;
          }
        }
      }

      if (element) {
        browser.runtime.sendMessage({
          action: MESSAGE_ACTION.OPEN_POPUP,
        });

        // fixme: 首次获取到的 base64 是错误的，必须重新获取一次
        const dataUrl = getBase64(element);

        setTimeout(async () => {
          const dataUrl = getBase64(element);

          const res = await predict(
            dataUrl.replace("data:image/png;base64,", "")
          );

          if (res) {
            const arr = JSON.parse(res);

            // 将 arr 发送给 background
            browser.runtime.sendMessage({
              action: MESSAGE_ACTION.PREDICTED,
              data: arr,
            });
          }
        }, 10);
      }

      sendResponse({
        success: !!element,
      });
    }
  });
}
