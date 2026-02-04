import axios from "axios";
import * as db from "./db";

/**
 * Sync skills from awesome-openclaw-skills repository
 * This service fetches skills data from the GitHub repository and syncs it to the database
 */

const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "VoltAgent";
const REPO_NAME = "awesome-openclaw-skills";

interface GitHubSkill {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  author?: string;
  repository?: string;
  downloadUrl?: string;
  rating?: number;
}

/**
 * Fetch skills from the awesome-openclaw-skills repository
 */
export async function fetchSkillsFromGitHub(): Promise<GitHubSkill[]> {
  try {
    // Fetch the README.md file which contains the skills list
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    const readme = response.data as string;
    const skills = parseSkillsFromReadme(readme);
    return skills;
  } catch (error) {
    console.error("Failed to fetch skills from GitHub:", error);
    throw new Error("Failed to fetch skills from GitHub");
  }
}

/**
 * Parse skills from the README.md content
 * This is a simplified parser - in production, you'd want more robust parsing
 */
function parseSkillsFromReadme(readme: string): GitHubSkill[] {
  const skills: GitHubSkill[] = [];
  const lines = readme.split("\n");

  let currentCategory = "Uncategorized";
  const skillPattern = /\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)/;

  for (const line of lines) {
    // Check if this is a category header (e.g., "## Web Development")
    if (line.startsWith("## ") && !line.includes("Table of Contents")) {
      currentCategory = line.replace("## ", "").trim();
      continue;
    }

    // Check if this is a skill entry (e.g., "- [Skill Name](url) - Description")
    const match = line.match(skillPattern);
    if (match) {
      const [, displayName, repository, description] = match;
      const name = displayName.toLowerCase().replace(/\s+/g, "-");

      skills.push({
        name,
        displayName,
        description: description.trim(),
        category: currentCategory,
        repository,
        downloadUrl: repository,
      });
    }
  }

  return skills;
}

/**
 * Sync skills to the database
 */
export async function syncSkillsToDatabase(skills: GitHubSkill[]): Promise<void> {
  console.log(`Syncing ${skills.length} skills to database...`);

  for (const skill of skills) {
    try {
      // Check if skill already exists
      // Check if skill already exists by name
      const existingSkills = await db.getAllSkills();
      const existing = existingSkills.find((s: { name: string }) => s.name === skill.name);

      if (existing) {
        // Update existing skill
        await db.updateSkill(existing.id, {
          displayName: skill.displayName,
          description: skill.description ?? undefined,
          category: skill.category ?? undefined,
          author: skill.author ?? undefined,
          sourceUrl: skill.repository ?? undefined,
        });
      } else {
        // Create new skill
        await db.createSkill({
          name: skill.name,
          displayName: skill.displayName,
          provider: "awesome-openclaw-skills",
          description: skill.description ?? undefined,
          category: skill.category ?? undefined,
          author: skill.author ?? undefined,
          sourceUrl: skill.repository ?? undefined,
          downloadCount: 0,
          rating: 0,
        });
      }
    } catch (error) {
      console.error(`Failed to sync skill ${skill.name}:`, error);
    }
  }

  console.log("Skills sync completed");
}

/**
 * Main sync function
 */
export async function syncSkills(): Promise<void> {
  try {
    console.log("Starting skills sync...");
    const skills = await fetchSkillsFromGitHub();
    await syncSkillsToDatabase(skills);
    console.log("Skills sync completed successfully");
  } catch (error) {
    console.error("Skills sync failed:", error);
    throw error;
  }
}
