const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found!" });

  request.user = user;

  return next();
}

app.use(cors());
app.use(express.json());

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userExists = users.some((user) => user.username === username);

  if (userExists)
    return response.status(400).json({ error: "Username already exists!" });

  const user = { id: uuidv4(), name, username, todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const toDoList = user.todos;

  return response.json(toDoList);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const toDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };

  user.todos.push(toDo);

  return response.status(201).json(toDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "To Do not found!" });

  toDo.title = title;
  toDo.deadline = deadline;

  return response.json(toDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "To Do not found!" });

  toDo.done = true;

  return response.json(toDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "To Do not found!" });

  user.todos.splice(toDo);

  return response.status(204).send();
});

module.exports = app;
