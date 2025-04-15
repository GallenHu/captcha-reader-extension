import browser, { addMessageListener } from "./utils/browser.utils";
import { predict } from "./utils/llm.utils";
import { getBase64 } from "./utils/image.utils";
import { MESSAGE_ACTION } from "./constants/message";
import { sleep } from "./utils/utitls";

export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    start();
  },
});

function start() {
  // 监听来自背景脚本的消息
  addMessageListener(async (request) => {
    switch (request.action) {
      case MESSAGE_ACTION.GET_IMAGE_INFO:
        const dataUrl = await getBase64FromUrl(request.imageUrl);

        // 回复至背景脚本
        return dataUrl;

      default:
        break;
    }
  });
}

async function getBase64FromUrl(imageUrl: string) {
  if (imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }

  let element: HTMLImageElement | null = null;
  let dataUrl: string | null = null;

  // 通过URL查找对应的图片元素
  let images: NodeListOf<HTMLImageElement> = document.querySelectorAll(
    `img[src="${imageUrl}"]`
  );

  if (images.length === 0) {
    images = document.querySelectorAll(`img[src]`);

    for (const image of images) {
      if (image.src === imageUrl) {
        element = image;
        break;
      }
    }
  } else {
    element = images[0];
  }

  if (element) {
    // fixme: 首次获取到的 base64 是错误的，必须重新获取一次
    dataUrl = getBase64(element);

    await sleep(10);

    dataUrl = getBase64(element);

    return dataUrl;
  } else {
    console.error("Failed to get image element：" + imageUrl);
    return null;
  }
}
