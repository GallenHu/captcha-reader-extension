export function getStorage(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key]);
    });
  });
}

export function setStorage(key: string, value: any) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve(true);
    });
  });
}
