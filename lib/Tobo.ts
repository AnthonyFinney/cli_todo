import path from "node:path";
import { mkdir, access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import type { TodoItem } from "../type";
import crypto from "node:crypto";

class Todo {
    private filePath: string;
    private readyStore: Promise<void>;

    constructor(dir: string) {
        this.filePath = path.join(dir, "todo.json");
        this.readyStore = this.store(dir);
    }

    public removeById = async (id: string): Promise<boolean> => {
        await this.readyStore;
        const raw = await readFile(this.filePath, "utf8");
        const data = JSON.parse(raw) as TodoItem[];
        const updatedData = data.filter((t) => t.id !== id);
        await writeFile(
            this.filePath,
            JSON.stringify(updatedData, null, 2),
            "utf8"
        );
        return data.length !== updatedData.length;
    };

    public removeAll = async (): Promise<void> => {
        await writeFile(this.filePath, "[]", "utf8");
    };

    public write = async (task: string): Promise<string> => {
        await this.readyStore;
        const raw = await readFile(this.filePath, "utf8");
        const data = JSON.parse(raw) as TodoItem[];

        const id = String(crypto.randomInt(0, 100000)).padStart(5, "0");

        const updatedData = [...data, { id, task }];
        await writeFile(
            this.filePath,
            JSON.stringify(updatedData, null, 2),
            "utf8"
        );

        return id;
    };

    public getAllTodo = async (): Promise<TodoItem[]> => {
        await this.readyStore;
        if (!(await this.checkfile())) return [];
        const raw = await readFile(this.filePath, "utf8");
        const data = JSON.parse(raw) as TodoItem[];
        const filtered = data.filter(
            (it: any) =>
                typeof it?.id === "string" &&
                typeof it?.task === "string" &&
                it.task.trim() !== ""
        ) as TodoItem[];
        if (filtered.length !== data.length) {
            await writeFile(
                this.filePath,
                JSON.stringify(filtered, null, 2),
                "utf8"
            );
        }
        return filtered;
    };

    public getTodoById = async (id: string): Promise<TodoItem | undefined> => {
        await this.readyStore;
        const raw = await readFile(this.filePath, "utf8");
        const data = JSON.parse(raw) as TodoItem[];
        const item = data.find((t) => t.id === id) as TodoItem;
        return item;
    };

    public checkfile = async (): Promise<boolean> => {
        try {
            await access(this.filePath, constants.F_OK);
            return true;
        } catch {
            return false;
        }
    };

    private store = async (dir: string): Promise<void> => {
        await mkdir(dir, { recursive: true });
        try {
            await access(this.filePath, constants.F_OK);
        } catch {
            await writeFile(this.filePath, "[]", "utf8");
            return;
        }
        try {
            const raw = await readFile(this.filePath, "utf8");
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                await writeFile(this.filePath, "[]", "utf8");
            } else {
                let changed = false;
                const sanitized = (parsed as any[])
                    .filter(
                        (it) =>
                            typeof it?.task === "string" &&
                            it.task.trim() !== ""
                    )
                    .map((it) => {
                        const id =
                            typeof it?.id === "string"
                                ? it.id
                                : String(crypto.randomInt(0, 100000)).padStart(
                                      5,
                                      "0"
                                  );
                        if (typeof it?.id !== "string") changed = true;
                        return { id, task: it.task } as TodoItem;
                    });
                if (sanitized.length !== (parsed as any[]).length)
                    changed = true;
                if (changed) {
                    await writeFile(
                        this.filePath,
                        JSON.stringify(sanitized, null, 2),
                        "utf8"
                    );
                }
            }
        } catch {
            await writeFile(this.filePath, "[]", "utf8");
        }
    };
}

export default Todo;
