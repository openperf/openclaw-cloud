import * as db from "./db";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Built-in skills metadata
 * These skills are bundled with OpenClaw Cloud and automatically initialized on server startup
 */
const BUILTIN_SKILLS = [
  {
    name: "aider-coding-assistant",
    displayName: "Aider Coding Assistant",
    description: "Use aider AI pair programming tool to write and modify code",
    category: "AI Coding",
    author: "OpenClaw Cloud",
    provider: "builtin",
    sourceUrl: "builtin",
    rating: 5.0,
  },
  // Add more built-in skills here in the future
];

/**
 * Initialize built-in skills on server startup
 * This function reads skill content from the builtinSkills directory
 * and creates/updates them in the database
 */
export async function initBuiltinSkills(): Promise<void> {
  console.log("[Skills] Initializing built-in skills...");

  for (const skillMeta of BUILTIN_SKILLS) {
    try {
      // Check if skill already exists
      const existing = await db.getSkillByName(skillMeta.name);
      
      // Read skill content from file
      const contentPath = path.join(__dirname, "builtinSkills", `${skillMeta.name}.md`);
      
      if (!fs.existsSync(contentPath)) {
        console.error(`[Skills] Content file not found: ${contentPath}`);
        continue;
      }
      
      const content = fs.readFileSync(contentPath, "utf-8");

      if (existing) {
        // Update existing skill content (in case it was modified)
        await db.updateSkill(existing.id, {
          description: skillMeta.description,
          displayName: skillMeta.displayName,
          category: skillMeta.category,
          author: skillMeta.author,
          rating: skillMeta.rating,
          metadata: { content },
        });
        console.log(`[Skills] Updated: ${skillMeta.displayName}`);
      } else {
        // Create new skill
        await db.createSkill({
          ...skillMeta,
          metadata: { content },
          downloadCount: 0,
        });
        console.log(`[Skills] Initialized: ${skillMeta.displayName}`);
      }
    } catch (error) {
      console.error(`[Skills] Failed to initialize ${skillMeta.displayName}:`, error);
    }
  }

  console.log("[Skills] Built-in skills initialization complete");
}

/**
 * Get list of built-in skill names
 * Useful for checking if a skill is built-in
 */
export function getBuiltinSkillNames(): string[] {
  return BUILTIN_SKILLS.map(skill => skill.name);
}

/**
 * Check if a skill is built-in
 */
export function isBuiltinSkill(skillName: string): boolean {
  return BUILTIN_SKILLS.some(skill => skill.name === skillName);
}
