import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import Todo from "./lib/Tobo";

const dir = path.join(process.cwd(), ".todo");
const todo = new Todo(dir);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(), "dist", "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile("index.html");
};

ipcMain.handle("todo:list", async () => {
    return await todo.getAllTodo();
});

ipcMain.handle("todo:add", async (_e, task: string) => {
    const id = await todo.write(task);
    return { id };
});

ipcMain.handle("todo:remove", async (_e, id: string) => {
    const removed = await todo.removeById(id);
    return { removed };
});

ipcMain.handle("todo:clear", async () => {
    await todo.removeAll();
    return { ok: true };
});

app.whenReady().then(() => {
    createWindow();
});
