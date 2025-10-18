import { describe, expect, test, beforeAll, beforeEach } from "bun:test";
import os from "node:os";
import path from "node:path";
import type { TodoItem } from "../type";
import Todo from "../lib/Tobo";

describe("todo", () => {
    let dir: string;
    let todo: Todo;
    const data: TodoItem = { id: "1", task: "H1", done: false };

    beforeAll(async () => {
        dir = path.join(os.homedir(), "todo");
        todo = new Todo(dir);
    });

    beforeEach(async () => {
        await todo.removeAll();
        await todo.write(data);
    });

    test("check for the file", async () => {
        const file: boolean = await todo.checkfile();
        expect(file).toBe(true);
    });

    test("read all item from the file", async () => {
        const parsed = await todo.getAllTodo();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toContainEqual(data);
    });

    test("read by id item from the file", async () => {
        const item = await todo.getTodoById(data.id);
        expect(item).toEqual({
            id: "1",
            task: "H1",
            done: false,
        });
    });

    test("write item from the file", async () => {
        const newItem: TodoItem = { id: "2", task: "A2", done: true };
        await todo.write(newItem);
        const data = await todo.getAllTodo();
        expect(data).toContainEqual(newItem);
    });

    test("remove by id item from the file", async () => {
        const newItem: TodoItem = { id: "2", task: "A2", done: true };
        await todo.write(newItem);
        const dataBef = await todo.getAllTodo();
        expect(dataBef).toContainEqual(newItem);

        await todo.removeById(newItem.id);
        const dataAft = await todo.getAllTodo();
        expect(dataAft).not.toContainEqual(newItem);
    });
});
