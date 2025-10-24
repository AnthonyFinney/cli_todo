import { describe, expect, test, beforeAll, beforeEach } from "bun:test";
import os from "node:os";
import path from "node:path";
import Todo from "../lib/Tobo";

describe("todo", () => {
    let dir: string;
    let todo: Todo;
    let id: string;
    const task = "newItem";

    beforeAll(async () => {
        dir = path.join(os.homedir(), "todo");
        todo = new Todo(dir);
    });

    beforeEach(async () => {
        await todo.removeAll();
        id = await todo.write(task);
    });

    test("check for the file", async () => {
        const file: boolean = await todo.checkfile();
        expect(file).toBe(true);
    });

    test("read all item from the file", async () => {
        const parsed = await todo.getAllTodo();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toEqual(
            expect.arrayContaining([expect.objectContaining({ id, task })])
        );
    });

    test("read by id item from the file", async () => {
        const item = await todo.getTodoById(id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(id);
        expect(item?.task).toBe("newItem");
    });

    test("write item from the file", async () => {
        const id = await todo.write("newItem");
        const item = await todo.getTodoById(id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(id);
        expect(item?.task).toBe("newItem");
    });

    test("remove by id item from the file", async () => {
        const id = await todo.write("newItem");
        const item = await todo.getTodoById(id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(id);
        expect(item?.task).toBe("newItem");

        await todo.removeById(id);
        const reitem = await todo.getTodoById(id);
        expect(reitem).toBeUndefined();
    });
});
