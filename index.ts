import path from "node:path";
import crypto from "node:crypto";
import { select, text, isCancel, cancel, spinner, intro } from "@clack/prompts";
import { spawn } from "node:child_process";
import Todo from "./lib/Tobo";
import type { TodoItem } from "./type";

const main = async (): Promise<void> => {
    intro("Welcome to the cli todo!");

    const dir = path.join(process.cwd(), ".todo");
    const todo = new Todo(dir);

    let running = true;
    while (running) {
        const action = await select({
            message: "Pick one to do -",
            options: [
                { value: "list", label: "List all todo for show and remove" },
                { value: "add", label: "Add new todo" },
                { value: "gui", label: "Open GUI" },
                { value: "quit", label: "quit" },
            ],
        });

        if (isCancel(action)) return cancel("Aborted");

        if (action === "list") {
            const s = spinner();
            s.start("Reading file");
            const items: TodoItem[] = await todo.getAllTodo();
            if (items.length) {
                s.stop("Getting...");
            } else {
                s.stop("Empty");
                continue;
            }

            const picked = await select({
                message: `Todos ${items.length} - pick one`,
                options: [
                    ...items.map((t) => ({
                        value: t.id,
                        label: `id: ${t.id}, task: ${t.task}`,
                    })),
                    { value: "back", label: "Back" },
                ],
            });

            if (isCancel(picked) || picked === "back") continue;

            const item = items.find((t) => t.id === picked);
            if (!item) continue;

            const next = await select({
                message: `Selected - id: ${item.id}, task: ${item.task}`,
                options: [
                    { value: "remove", label: "Remove" },
                    { value: "back", label: "Back" },
                ],
            });

            if (isCancel(next) || next === "back") continue;

            if (next === "remove") {
                const s2 = spinner();
                s2.start("Removing...");
                const res = await todo.removeById(item.id);
                if (res) {
                    s2.stop("Done");
                } else {
                    s2.stop("Id not found");
                }
            }
        }

        if (action === "add") {
            const task = await text({
                message: "Task: ",
                validate: (v) => (v.trim() ? undefined : "Task is needed!"),
            });
            if (isCancel(task)) return;

            const id = String(crypto.randomInt(0, 100000)).padStart(5, "0");

            const todoItem: TodoItem = {
                id,
                task,
            };

            const s = spinner();
            s.start("Saving...");
            await todo.write(todoItem);
            s.stop("Done");
        }

        if (action === "gui") {
            const s = spinner();
            s.start("Opening GUI...");

            try {
                const mod = (await import("electron")) as unknown as {
                    default: string;
                };
                const electronPath = mod.default;

                const child = spawn(electronPath, ["."], {
                    stdio: "inherit",
                });

                s.stop("GUI launched");

                running = false;

                await new Promise<void>((resolve) => {
                    child.on("exit", () => resolve());
                });
            } catch (err) {
                s.stop("Failed to open GUI");
                console.log(err);
            }
        }

        if (action === "quit") {
            running = false;
        }
    }
};

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
