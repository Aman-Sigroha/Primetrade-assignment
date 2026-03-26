import { describe, expect, it, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { disconnectDB, connectDB } from "@/lib/db";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { GET as tasksGet, POST as tasksPost } from "@/app/api/v1/tasks/route";
import {
  GET as taskByIdGet,
  PUT as taskByIdPut,
  DELETE as taskByIdDelete,
} from "@/app/api/v1/tasks/[id]/route";
import { User } from "@/models/User";
import { generateToken } from "@/lib/auth";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await connectDB();
});

afterEach(async () => {
  const cols = mongoose.connection.collections;
  for (const key of Object.keys(cols)) {
    await cols[key].deleteMany({});
  }
});

afterAll(async () => {
  await disconnectDB();
  await mongo.stop();
});

function jsonReq(
  path: string,
  init: Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): Request {
  const { body, headers = {}, ...rest } = init;
  return new Request(`http://localhost${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function registerUser(payload: { name: string; email: string; password: string }) {
  const res = await register(jsonReq("/api/v1/auth/register", { method: "POST", body: payload }));
  const data = (await res.json()) as {
    success: boolean;
    data?: { token: string; user: { id: string; role: string } };
  };
  return { res, data };
}

describe("auth APIs", () => {
  it("registers and returns token", async () => {
    const { res, data } = await registerUser({
      name: "Ada",
      email: "ada@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data?.token).toBeDefined();
    expect(data.data?.user.role).toBe("user");
  });

  it("returns 409 on duplicate email", async () => {
    await registerUser({ name: "A", email: "dup@example.com", password: "password123" });
    const { res, data } = await registerUser({
      name: "B",
      email: "dup@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
  });

  it("logs in with valid credentials", async () => {
    await registerUser({ name: "bob", email: "bob@example.com", password: "password123" });
    const res = await login(
      jsonReq("/api/v1/auth/login", {
        method: "POST",
        body: { email: "bob@example.com", password: "password123" },
      })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data?: { token: string } };
    expect(data.success).toBe(true);
    expect(data.data?.token).toBeDefined();
  });

  it("returns 401 on bad password", async () => {
    await registerUser({ name: "c", email: "c@example.com", password: "password123" });
    const res = await login(
      jsonReq("/api/v1/auth/login", {
        method: "POST",
        body: { email: "c@example.com", password: "wrong-pass" },
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("task APIs", () => {
  let tokenA: string;
  let userAId: string;
  let tokenB: string;
  let adminToken: string;

  beforeEach(async () => {
    const regA = await registerUser({
      name: "User A",
      email: "usera@example.com",
      password: "password123",
    });
    tokenA = regA.data.data!.token;
    userAId = regA.data.data!.user.id;

    const regB = await registerUser({
      name: "User B",
      email: "userb@example.com",
      password: "password123",
    });
    tokenB = regB.data.data!.token;

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(admin._id.toString(), "admin");
  });

  it("creates and lists tasks for owner", async () => {
    const post = await tasksPost(
      jsonReq("/api/v1/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: "First", description: "Desc" },
      })
    );
    expect(post.status).toBe(201);

    const list = await tasksGet(
      jsonReq("/api/v1/tasks", { method: "GET", headers: { Authorization: `Bearer ${tokenA}` } })
    );
    expect(list.status).toBe(200);
    const body = (await list.json()) as { data: { tasks: { title: string }[] } };
    expect(body.data.tasks).toHaveLength(1);
    expect(body.data.tasks[0].title).toBe("First");
  });

  it("returns 401 without bearer token", async () => {
    const list = await tasksGet(jsonReq("/api/v1/tasks", { method: "GET" }));
    expect(list.status).toBe(401);
  });

  it("forbids non-admin from filtering by another userId", async () => {
    const res = await tasksGet(
      jsonReq(`/api/v1/tasks?userId=${userAId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenB}` },
      })
    );
    expect(res.status).toBe(403);
  });

  it("allows admin to list all tasks", async () => {
    await tasksPost(
      jsonReq("/api/v1/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: "From A" },
      })
    );
    const res = await tasksGet(
      jsonReq("/api/v1/tasks", { method: "GET", headers: { Authorization: `Bearer ${adminToken}` } })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { tasks: unknown[] } };
    expect(body.data.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it("owner can update and get task; stranger cannot delete", async () => {
    const created = await tasksPost(
      jsonReq("/api/v1/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: "Mutable" },
      })
    );
    const createdBody = (await created.json()) as { data: { id: string } };
    const id = createdBody.data.id;

    const getOk = await taskByIdGet(
      jsonReq(`/api/v1/tasks/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenA}` },
      }),
      { params: { id } }
    );
    expect(getOk.status).toBe(200);

    const put = await taskByIdPut(
      jsonReq(`/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: "Updated" },
      }),
      { params: { id } }
    );
    expect(put.status).toBe(200);

    const delForbidden = await taskByIdDelete(
      jsonReq(`/api/v1/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenB}` },
      }),
      { params: { id } }
    );
    expect(delForbidden.status).toBe(403);

    const delOk = await taskByIdDelete(
      jsonReq(`/api/v1/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenA}` },
      }),
      { params: { id } }
    );
    expect(delOk.status).toBe(200);
  });

  it("returns 400 for invalid ObjectId", async () => {
    const res = await taskByIdGet(
      jsonReq("/api/v1/tasks/not-an-id", {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenA}` },
      }),
      { params: { id: "not-an-id" } }
    );
    expect(res.status).toBe(400);
  });
});
