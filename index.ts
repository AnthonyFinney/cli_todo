import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { select, text, isCancel, cancel, spinner, intro } from "@clack/prompts";
import Todo from "./lib/Tobo";
import type { TodoItem } from "./type";

const main = async (): Promise<void> => {
    intro("Welcome to the cli todo!");

    const dir = path.join(os.homedir(), ".todo");
    const todo = new Todo(dir);

    let running = true;
    while (running) {
        const action = await select({
            message: "Pick one to do -",
            options: [
                { value: "list", label: "List all todo" },
                { value: "add", label: "Add new todo" },
                { value: "show", label: "Show todo by id" },
                { value: "remove", label: "remove todo by id" },
                { value: "quit", label: "quit" },
            ],
        });

        if (isCancel(action)) return cancel("Aborted");

        if (action === "list") {
            const s = spinner();
            s.start("Reading file");
            const items: TodoItem[] = await todo.getAllTodo();
            s.stop("Done");
            if (!items.length) {
                console.log("Empty");
            } else {
                items.forEach((t, i) => {
                    console.log(`id: ${t.id}, task: ${t.task}`);
                });
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
            s.start("Saving");
            await todo.write(todoItem);
            s.stop("Done");
        }

        if (action === "show") {
            const id = await text({
                message: "Enter ID:",
                validate: (v) => (v.trim() ? undefined : "Id is needed!"),
            });
            if (isCancel(id)) return;

            const s = spinner();
            s.start("Getting");
            const item = await todo.getTodoById(id);
            s.stop("Done");

            if (!item) {
                console.log("Todo not found");
            }

            console.log(`id: ${item?.id}, task: ${item?.task}`);
        }

        if (action === "remove") {
            const id = await text({
                message: "Enter ID:",
                validate: (v) => (v.trim() ? undefined : "Id is needed!"),
            });
            if (isCancel(id)) return;

            const s = spinner();
            s.start("Removing");
            await todo.removeById(id);
            s.stop("Done");
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
