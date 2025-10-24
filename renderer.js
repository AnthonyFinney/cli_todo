const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");
const countEl = document.getElementById("todo-count");
const formEl = document.getElementById("add-form");
const inputEl = document.getElementById("task-input");
const refreshBtn = document.getElementById("refresh-btn");
const clearBtn = document.getElementById("clear-btn");

async function render() {
    const todos = await window.todo.list();
    countEl.textContent = String(todos.length);
    listEl.innerHTML = "";
    emptyEl.style.display = todos.length ? "none" : "block";

    for (const t of todos) {
        const li = document.createElement("li");
        li.className = "todo";
        li.innerHTML = `
            <span class="id">${t.id}</span>
            <span class="task"></span>
            <span class="actions">
                <button class="btn btn-danger" data-id="${t.id}">Remove</button>
            </span>
        `;
        li.querySelector(".task").textContent = t.task ?? "(empty)";
        li.querySelector("button").addEventListener("click", async () => {
            const api = window.todo;
            if (typeof api.removeById === "function") {
                await api.removeById(t.id);
            } else {
                await api.remove(t.id);
            }
            await render();
        });
        listEl.appendChild(li);
    }
}

formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const task = inputEl.value.trim();
    if (!task) return;
    await window.todo.add(task);
    inputEl.value = "";
    await render();
});

refreshBtn.addEventListener("click", render);

clearBtn.addEventListener("click", async () => {
    await window.todo.clear();
    await render();
});

render();
