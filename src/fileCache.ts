import localForage from "localforage";

export const fileCache = localForage.createInstance({ name: "filecache" });
