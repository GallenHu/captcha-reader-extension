import browser from "./browser.utils";

export function getStorage(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(key).then((result) => {
      resolve(result[key] as string);
    });
  });
}

export function setStorage(key: string, value: any) {
  return browser.storage.local.set({ [key]: value });
}
