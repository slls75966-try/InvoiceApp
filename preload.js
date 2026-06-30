const { contextBridge } = require("electron");

// API exposée au navigateur (à enrichir plus tard si nécessaire)
contextBridge.exposeInMainWorld("electronAPI", {});