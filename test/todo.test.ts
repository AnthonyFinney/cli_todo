import { describe, expect, test } from "bun:test";
import os from "node:os";
import path from "node:path";
import { mkdir } from "node:fs/promises";

describe("todo", () => {
    test("creates the store", async () => {
        const dir: string = path.join(os.homedir(), "todo");
        await mkdir(dir, { recursive: true });

        const filePath: string = path.join(dir, "todo.json");

        await Bun.write(filePath, "{}");

        const exists: boolean = await Bun.file(filePath).exists();
        expect(exists).toBe(true);
    });

    test.todo("read item from the store", () => {});

    test.todo("write item from the store", () => {});

    test.todo("remove item from the store", () => {});
});
