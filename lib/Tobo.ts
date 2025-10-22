import path from "node:path";
import { mkdir } from "node:fs/promises";
import type { TodoItem } from "../type";

class Todo {
    private filePath: string;
    private readyStore: Promise<void>;

    constructor(dir: string) {
        this.filePath = path.join(dir, "todo.json");
        this.readyStore = this.store(dir);
    }

    public removeById = async (id: string): Promise<boolean> => {
        await this.readyStore;
        const data = (await Bun.file(this.filePath).json()) as TodoItem[];

        if (data.find((t) => t.id === id)) {
            const updatedData = data.filter((t) => t.id !== id);
            await Bun.write(
                this.filePath,
                JSON.stringify(updatedData, null, 2)
            );
            return true;
        } else {
            return false;
        }
    };

    public removeAll = async (): Promise<void> => {
        await Bun.write(this.filePath, "[]");
    };

    public write = async (todo: TodoItem): Promise<void> => {
        await this.readyStore;
        const data = (await Bun.file(this.filePath).json()) as TodoItem[];
        const updatedData = [...data, todo];
        await Bun.write(this.filePath, JSON.stringify(updatedData, null, 2));
    };

    public getAllTodo = async (): Promise<TodoItem[]> => {
        await this.readyStore;
        if (!(await this.checkfile())) return [];
        const parsed = (await Bun.file(this.filePath).json()) as TodoItem[];
        return parsed;
    };

    public getTodoById = async (id: string): Promise<TodoItem | undefined> => {
        await this.readyStore;
        const parsed = (await Bun.file(this.filePath).json()) as TodoItem[];
        const item = parsed.find((t) => t.id === id) as TodoItem;
        return item;
    };

    public checkfile = async (): Promise<boolean> => {
        const file = Bun.file(this.filePath);
        if (!(await file.exists())) return false;
        return true;
    };

    private store = async (dir: string): Promise<void> => {
        await mkdir(dir, { recursive: true });
        const file = Bun.file(this.filePath);
        if (!(await file.exists())) {
            await Bun.write(this.filePath, "[]");
        } else {
            try {
                const parsed = await file.json();
                if (!Array.isArray(parsed))
                    await Bun.write(this.filePath, "[]");
            } catch {
                await Bun.write(this.filePath, "[]");
            }
        }
    };
}

export default Todo;
