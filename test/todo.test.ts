import { describe, expect, test, beforeAll, beforeEach } from "bun:test";
import os from "node:os";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import type { Todo } from "../type";

describe("todo", () => {
    let dir: string;
    let filePath: string;
    const data: Todo[] = [{ id: "1", task: "H1", done: false }];

    beforeAll(async () => {
        dir = path.join(os.homedir(), "todo");
        await mkdir(dir, { recursive: true });
        filePath = path.join(dir, "todo.json");
        await Bun.write(filePath, JSON.stringify(data, null, 2));
    });

    beforeEach(async () => {
        await Bun.write(filePath, JSON.stringify(data, null, 2));
    });

    test("check for the file", async () => {
        const file: boolean = await Bun.file(filePath).exists();
        expect(file).toBe(true);
    });

    test("read all item from the file", async () => {
        const file = Bun.file(filePath);
        const parsed = await file.json();
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toEqual(data);
    });

    test("read by id item from the file", async () => {
        const parsed = (await Bun.file(filePath).json()) as Todo[];
        const item = parsed.find((t) => t.id === data[0]?.id);
        expect(item).toEqual({
            id: "1",
            task: "H1",
            done: false,
        });
    });

    test("write item from the file", async () => {
        const dataBef = (await Bun.file(filePath).json()) as Todo[];
        const newItem: Todo = { id: "2", task: "A2", done: true };

        const updatedData = [...dataBef, newItem];

        await Bun.write(filePath, JSON.stringify(updatedData, null, 2));

        const dataAft = (await Bun.file(filePath).json()) as Todo[];

        expect(dataAft).toContainEqual(newItem);
    });

    test("remove by id item from the file", async () => {
        const dataBef = (await Bun.file(filePath).json()) as Todo[];
        const item = data[0] as Todo;
        const updatedData = dataBef.filter((t) => t.id !== item.id);

        await Bun.write(filePath, JSON.stringify(updatedData, null, 2));

        const dataAft = (await Bun.file(filePath).json()) as Todo[];

        expect(dataAft).not.toContainEqual(item);
    });
});
