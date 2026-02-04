import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("instances", () => {
  it("should list instances for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const instances = await caller.instances.list();
    expect(Array.isArray(instances)).toBe(true);
  });

  it("should create a new instance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const instance = await caller.instances.create({
      name: "Test Instance",
      description: "A test instance",
      config: { testKey: "testValue" },
    });

    expect(instance).toHaveProperty("id");
    expect(instance.name).toBe("Test Instance");
    expect(instance.description).toBe("A test instance");
    expect(instance.status).toBe("stopped");
  });

  it("should update an instance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an instance first
    const instance = await caller.instances.create({
      name: "Test Instance",
    });

    // Update the instance
    const result = await caller.instances.update({
      id: instance.id,
      name: "Updated Instance",
      status: "running",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const updated = await caller.instances.get({ id: instance.id });
    expect(updated?.name).toBe("Updated Instance");
    expect(updated?.status).toBe("running");
  });

  it("should delete an instance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an instance first
    const instance = await caller.instances.create({
      name: "Test Instance",
    });

    // Delete the instance
    const result = await caller.instances.delete({ id: instance.id });
    expect(result.success).toBe(true);

    // Verify deletion
    const deleted = await caller.instances.get({ id: instance.id });
    expect(deleted).toBeUndefined();
  });
});
