import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("todo", {
    list: () => ipcRenderer.invoke("todo:list"),
    add: (task: string) => ipcRenderer.invoke("todo:add", task),
    remove: (id: string) => ipcRenderer.invoke("todo:remove", id),
    removeById: (id: string) => ipcRenderer.invoke("todo:remove", id),
    clear: () => ipcRenderer.invoke("todo:clear"),
});
