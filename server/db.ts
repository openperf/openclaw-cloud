import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  instances, Instance, InsertInstance,
  plugins, Plugin, InsertPlugin,
  pluginConfigs, PluginConfig, InsertPluginConfig,
  skills, Skill, InsertSkill,
  installedSkills, InstalledSkill, InsertInstalledSkill,
  skillCollections, SkillCollection, InsertSkillCollection
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== User Functions =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Instance Functions =====

export async function createInstance(instance: InsertInstance): Promise<Instance> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(instances).values(instance);
  const insertId = Number((result as any)[0]?.insertId ?? (result as any).insertId);
  if (!insertId || isNaN(insertId)) {
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(instances).where(eq(instances.id, insertId));
  if (!created) throw new Error("Failed to create instance");
  return created;
}

export async function getAllInstances(): Promise<Instance[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(instances).orderBy(desc(instances.createdAt));
}

export async function getInstancesByUserId(userId: number): Promise<Instance[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(instances).where(eq(instances.userId, userId)).orderBy(desc(instances.createdAt));
}

export async function getInstanceById(id: number): Promise<Instance | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(instances).where(eq(instances.id, id)).limit(1);
  return result[0];
}

export async function updateInstance(id: number, updates: Partial<Omit<Instance, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(instances).set({ ...updates, updatedAt: new Date() }).where(eq(instances.id, id));
}

export async function deleteInstance(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(instances).where(eq(instances.id, id));
}

// ===== Plugin Functions =====

export async function getAllPlugins(): Promise<Plugin[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(plugins).orderBy(plugins.displayName);
}

export async function getPluginById(id: number): Promise<Plugin | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(plugins).where(eq(plugins.id, id)).limit(1);
  return result[0];
}

export async function getPluginByName(name: string): Promise<Plugin | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(plugins).where(eq(plugins.name, name)).limit(1);
  return result[0];
}

export async function createPlugin(plugin: InsertPlugin): Promise<Plugin> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(plugins).values(plugin);
  const insertId = (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    const [created] = await db.select().from(plugins).where(eq(plugins.name, plugin.name)).limit(1);
    if (!created) throw new Error("Failed to create plugin");
    return created;
  }
  const [created] = await db.select().from(plugins).where(eq(plugins.id, Number(insertId)));
  if (!created) throw new Error("Failed to create plugin");
  return created;
}

export async function updatePlugin(id: number, updates: Partial<Omit<Plugin, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(plugins).set({ ...updates, updatedAt: new Date() }).where(eq(plugins.id, id));
}

export async function deletePlugin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(plugins).where(eq(plugins.id, id));
}

// ===== Plugin Config Functions =====

export async function getPluginConfigsByInstanceId(instanceId: number): Promise<PluginConfig[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(pluginConfigs).where(eq(pluginConfigs.instanceId, instanceId));
}

export async function getPluginConfig(instanceId: number, pluginId: number): Promise<PluginConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pluginConfigs)
    .where(and(eq(pluginConfigs.instanceId, instanceId), eq(pluginConfigs.pluginId, pluginId)))
    .limit(1);
  return result[0];
}

export async function upsertPluginConfig(config: InsertPluginConfig): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pluginConfigs).values(config).onDuplicateKeyUpdate({
    set: { config: config.config, enabled: config.enabled, updatedAt: new Date() },
  });
}

// ===== Skill Functions =====

export async function getAllSkills(): Promise<Skill[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(skills).orderBy(desc(skills.downloadCount));
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(skills).where(eq(skills.category, category)).orderBy(desc(skills.downloadCount));
}

export async function getSkillById(id: number): Promise<Skill | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return result[0];
}

export async function getSkillByName(name: string): Promise<Skill | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(skills).where(eq(skills.name, name)).limit(1);
  return result[0];
}

export async function createSkill(skill: InsertSkill): Promise<Skill> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(skills).values(skill);
  const insertId = (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    // Fallback: find by name if insertId is not available
    const [created] = await db.select().from(skills).where(eq(skills.name, skill.name)).limit(1);
    if (!created) throw new Error("Failed to create skill");
    return created;
  }
  const [created] = await db.select().from(skills).where(eq(skills.id, Number(insertId)));
  if (!created) throw new Error("Failed to create skill");
  return created;
}

export async function updateSkill(id: number, updates: Partial<Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(skills).set({ ...updates, updatedAt: new Date() }).where(eq(skills.id, id));
}

export async function deleteSkill(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(skills).where(eq(skills.id, id));
}

export async function incrementSkillDownloadCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const skill = await getSkillById(id);
  if (skill) {
    await updateSkill(id, { downloadCount: (skill.downloadCount || 0) + 1 });
  }
}

export async function recordSkillUsage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const skill = await getSkillById(id);
  if (skill) {
    await updateSkill(id, { 
      usage_count: (skill.usage_count || 0) + 1,
      last_used_at: new Date()
    });
  }
}

// ===== Installed Skill Functions =====

export async function getInstalledSkillsByInstanceId(instanceId: number): Promise<InstalledSkill[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(installedSkills).where(eq(installedSkills.instanceId, instanceId));
}

export async function getInstalledSkill(instanceId: number, skillId: number): Promise<InstalledSkill | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(installedSkills)
    .where(and(eq(installedSkills.instanceId, instanceId), eq(installedSkills.skillId, skillId)))
    .limit(1);
  return result[0];
}

export async function createInstalledSkill(installedSkill: InsertInstalledSkill): Promise<InstalledSkill> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(installedSkills).values(installedSkill);
  const insertId = (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    const [created] = await db.select().from(installedSkills)
      .where(and(
        eq(installedSkills.instanceId, installedSkill.instanceId),
        eq(installedSkills.skillId, installedSkill.skillId)
      ))
      .limit(1);
    if (!created) throw new Error("Failed to create installed skill");
    return created;
  }
  const [created] = await db.select().from(installedSkills).where(eq(installedSkills.id, Number(insertId)));
  if (!created) throw new Error("Failed to create installed skill");
  return created;
}

export async function updateInstalledSkill(id: number, updates: Partial<Omit<InstalledSkill, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(installedSkills).set({ ...updates, updatedAt: new Date() }).where(eq(installedSkills.id, id));
}

export async function deleteInstalledSkill(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(installedSkills).where(eq(installedSkills.id, id));
}

// ===== Skill Collection Functions =====

export async function getSkillCollectionsByUserId(userId: number): Promise<SkillCollection[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(skillCollections).where(eq(skillCollections.userId, userId)).orderBy(desc(skillCollections.createdAt));
}

export async function getSkillCollectionById(id: number): Promise<SkillCollection | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(skillCollections).where(eq(skillCollections.id, id)).limit(1);
  return result[0];
}

export async function createSkillCollection(collection: InsertSkillCollection): Promise<SkillCollection> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(skillCollections).values(collection);
  const insertId = (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    const [created] = await db.select().from(skillCollections)
      .where(and(
        eq(skillCollections.userId, collection.userId),
        eq(skillCollections.name, collection.name)
      ))
      .limit(1);
    if (!created) throw new Error("Failed to create skill collection");
    return created;
  }
  const [created] = await db.select().from(skillCollections).where(eq(skillCollections.id, Number(insertId)));
  if (!created) throw new Error("Failed to create skill collection");
  return created;
}

export async function updateSkillCollection(id: number, updates: Partial<Omit<SkillCollection, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(skillCollections).set({ ...updates, updatedAt: new Date() }).where(eq(skillCollections.id, id));
}

export async function deleteSkillCollection(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(skillCollections).where(eq(skillCollections.id, id));
}
