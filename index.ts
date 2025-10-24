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

            const s = spinner();
            s.start("Saving...");
            await todo.write(task);
            s.stop("Done");
        }

        if (action === "gui") {
            const s = spinner();
            s.start("Building GUI...");

            try {
                const buildMain = spawn(
                    process.platform === "win32" ? "bun.exe" : "bun",
                    [
                        "build",
                        "main.ts",
                        "--outdir",
                        "dist",
                        "--target=node",
                        "--external",
                        "electron",
                        "--external",
                        "node:*",
                    ],
                    { stdio: "inherit" }
                );

                await new Promise<void>((resolve, reject) => {
                    buildMain.on("exit", (code) =>
                        code === 0
                            ? resolve()
                            : reject(
                                  new Error(
                                      `bun build (main) exited with code ${code}`
                                  )
                              )
                    );
                    buildMain.on("error", reject);
                });

                const buildPreload = spawn(
                    process.platform === "win32" ? "bun.exe" : "bun",
                    [
                        "build",
                        "preload.ts",
                        "--outfile",
                        "dist/preload.cjs",
                        "--target=node",
                        "--format=cjs",
                        "--external",
                        "electron",
                        "--external",
                        "node:*",
                    ],
                    { stdio: "inherit" }
                );

                await new Promise<void>((resolve, reject) => {
                    buildPreload.on("exit", (code) =>
                        code === 0
                            ? resolve()
                            : reject(
                                  new Error(
                                      `bun build (preload) exited with code ${code}`
                                  )
                              )
                    );
                    buildPreload.on("error", reject);
                });

                const buildBrowser = spawn(
                    process.platform === "win32" ? "bun.exe" : "bun",
                    [
                        "build",
                        "renderer.js",
                        "--outdir",
                        "dist",
                        "--target=browser",
                    ],
                    { stdio: "inherit" }
                );

                await new Promise<void>((resolve, reject) => {
                    buildBrowser.on("exit", (code) =>
                        code === 0
                            ? resolve()
                            : reject(
                                  new Error(
                                      `bun build (browser) exited with code ${code}`
                                  )
                              )
                    );
                    buildBrowser.on("error", reject);
                });

                s.stop("Built. Launching GUI...");

                const mod = (await import("electron")) as unknown as {
                    default: string;
                };
                const electronPath = mod.default;

                const child = spawn(electronPath, ["."], { stdio: "inherit" });

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
