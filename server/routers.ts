import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { syncSkills } from "./skillsSync";
import * as docker from "./docker";
import * as pluginDocker from "./pluginDocker";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  instances: router({
    list: publicProcedure.query(async () => {
      return db.getAllInstances();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getInstanceById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        llmProvider: z.string().optional(),
        llmApiKey: z.string().optional(),
        llmModel: z.string().optional(),
        config: z.object({
          provider: z.enum(["openai", "anthropic", "ollama", "openrouter", "litellm", "custom"]),
          model: z.string().optional(),
          apiKey: z.string(),
          baseUrl: z.string().optional(),
          telegram: z.object({
            botToken: z.string(),
            chatId: z.string().optional(),
          }).optional(),
          discord: z.object({
            token: z.string(),
            guildId: z.string().optional(),
            channelId: z.string().optional(),
          }).optional(),
          slack: z.object({
            botToken: z.string(),
            appToken: z.string(),
          }).optional(),
          matrix: z.object({
            homeserverUrl: z.string(),
            accessToken: z.string(),
            roomId: z.string().optional(),
            dmPolicy: z.enum(["pairing", "open", "allowlist", "disabled"]).optional(),
          }).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        // Get next available port
        const allInstances = await db.getAllInstances();
        const usedPorts = allInstances.map(i => i.port).filter((p): p is number => p !== null);
        const nextPort = usedPorts.length > 0 ? Math.max(...usedPorts) + 1 : 18790;
        
        // Create instance in database
        const instance = await db.createInstance({
          userId: 1, // Default user ID since we don't have auth
          name: input.name,
          description: input.description ?? undefined,
          llmProvider: input.llmProvider ?? undefined,
          llmApiKey: input.llmApiKey ?? undefined,
          llmModel: input.llmModel ?? undefined,
          config: input.config,
          status: "stopped",
          port: nextPort,
        });
        
        // Create Docker container
        await docker.createInstance({
          instanceId: instance.id.toString(),
          name: input.name,
          port: instance.port!, // Use the port assigned in database
          provider: input.config.provider,
          model: input.config.model,
          apiKey: input.config.apiKey,
          baseUrl: input.config.baseUrl,
          telegramToken: input.config.telegram?.botToken,
          telegramChatId: input.config.telegram?.chatId,
          discordToken: input.config.discord?.token,
          discordGuildId: input.config.discord?.guildId,
          discordChannelId: input.config.discord?.channelId,
          slackBotToken: input.config.slack?.botToken,
          slackAppToken: input.config.slack?.appToken,
          matrixHomeserverUrl: input.config.matrix?.homeserverUrl,
          matrixAccessToken: input.config.matrix?.accessToken,
          matrixRoomId: input.config.matrix?.roomId,
          matrixDmPolicy: input.config.matrix?.dmPolicy,
        });
        
        // Update status to running
        await db.updateInstance(instance.id, { status: "running" });
        
        return instance;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        llmProvider: z.string().optional(),
        llmApiKey: z.string().optional(),
        llmModel: z.string().optional(),
        status: z.enum(["running", "stopped", "error"]).optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        
        // Get current instance
        const instance = await db.getInstanceById(id);
        if (!instance) {
          throw new Error("Instance not found");
        }
        
        // Update database
        if (Object.keys(updates).length > 0) {
          await db.updateInstance(id, updates);
        }
        
        // If instance is running, restart it to apply changes
        if (instance.status === "running") {
          await docker.stopInstance(id.toString());
          await docker.startInstance(id.toString());
        }
        
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Delete Docker container first
        await docker.deleteInstance(input.id.toString());
        // Then delete from database
        await db.deleteInstance(input.id);
        return { success: true };
      }),

    start: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Get instance config from database
        const instance = await db.getInstanceById(input.id);
        if (!instance) {
          return { success: false, error: "Instance not found" };
        }
        
        // Prepare config for container recreation
        const config = instance.config as any;
        const instanceConfig = {
          instanceId: instance.id.toString(),
          name: instance.name,
          port: instance.port!,
          provider: instance.llmProvider || config.provider,
          model: instance.llmModel || config.model,
          apiKey: instance.llmApiKey || config.apiKey,
          baseUrl: config.baseUrl,
          telegramToken: config.telegram?.botToken,
          telegramChatId: config.telegram?.chatId,
          discordToken: config.discord?.token,
          discordGuildId: config.discord?.guildId,
          discordChannelId: config.discord?.channelId,
          slackBotToken: config.slack?.botToken,
          slackAppToken: config.slack?.appToken,
          matrixHomeserverUrl: config.matrix?.homeserverUrl,
          matrixAccessToken: config.matrix?.accessToken,
          matrixRoomId: config.matrix?.roomId,
          matrixDmPolicy: config.matrix?.dmPolicy,
        };
        
        const result = await docker.startInstance(instance.id.toString(), instanceConfig);
        if (result.success) {
          await db.updateInstance(input.id, { status: "running" });
        }
        return result;
      }),

    stop: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await docker.stopInstance(input.id.toString());
        if (result.success) {
          await db.updateInstance(input.id, { status: "stopped" });
        }
        return result;
      }),

    status: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return docker.getInstanceStatus(input.id.toString());
      }),

    logs: publicProcedure
      .input(z.object({ 
        id: z.number(),
        tail: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return docker.getInstanceLogs(input.id.toString(), input.tail);
      }),

    stats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return docker.getInstanceStats(input.id.toString());
      }),
  }),

  plugins: router({
    list: publicProcedure.query(async () => {
      return db.getAllPlugins();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPluginById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        displayName: z.string().min(1),
        type: z.enum(["channel", "deployment", "monitoring", "skill-provider", "infrastructure", "other"]),
        version: z.string(),
        description: z.string().optional(),
        author: z.string().optional(),
        configSchema: z.record(z.string(), z.unknown()).optional(),
        dockerImage: z.string().optional(),
        dockerTag: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createPlugin({
          name: input.name,
          displayName: input.displayName,
          type: input.type,
          version: input.version,
          description: input.description ?? undefined,
          author: input.author ?? undefined,
          configSchema: input.configSchema ?? undefined,
          dockerImage: input.dockerImage ?? undefined,
          dockerTag: input.dockerTag ?? "latest",
          enabled: false,
          installed: false,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        enabled: z.boolean().optional(),
        installed: z.boolean().optional(),
        configSchema: z.record(z.string(), z.unknown()).optional(),
        containerId: z.string().optional(),
        containerStatus: z.enum(["running", "stopped", "error", "not_installed"]).optional(),
        hostPort: z.number().optional(),
        pluginConfig: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        if (Object.keys(updates).length > 0) {
          await db.updatePlugin(id, updates);
        }
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlugin(input.id);
        return { success: true };
      }),

    getConfig: protectedProcedure
      .input(z.object({
        instanceId: z.number(),
        pluginId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getPluginConfig(input.instanceId, input.pluginId);
      }),

    updateConfig: protectedProcedure
      .input(z.object({
        instanceId: z.number(),
        pluginId: z.number(),
        config: z.record(z.string(), z.unknown()),
        enabled: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertPluginConfig({
          instanceId: input.instanceId,
          pluginId: input.pluginId,
          config: input.config,
          enabled: input.enabled ?? true,
        });
        return { success: true };
      }),

    // Synapse 插件管理 API
    synapse: router({
      install: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          serverName: z.string().min(1),
          reportStats: z.boolean().default(false),
          httpPort: z.number().optional(),
          enableRegistration: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          const plugin = await db.getPluginById(input.pluginId);
          if (!plugin) {
            throw new Error("Plugin not found");
          }

          const result = await pluginDocker.installSynapse(
            `synapse-${input.pluginId}`,
            {
              serverName: input.serverName,
              reportStats: input.reportStats,
              httpPort: input.httpPort,
              enableRegistration: input.enableRegistration,
            }
          );

          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              installed: true,
              enabled: true,
              containerStatus: "running",
              hostPort: result.port,
              pluginConfig: {
                serverName: input.serverName,
                reportStats: input.reportStats,
                enableRegistration: input.enableRegistration,
              },
            });
          }

          return result;
        }),

      start: protectedProcedure
        .input(z.object({ pluginId: z.number() }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.startSynapse(`synapse-${input.pluginId}`);
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              enabled: true,
              containerStatus: "running",
            });
          }
          return result;
        }),

      stop: protectedProcedure
        .input(z.object({ pluginId: z.number() }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.stopSynapse(`synapse-${input.pluginId}`);
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              enabled: false,
              containerStatus: "stopped",
            });
          }
          return result;
        }),

      uninstall: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          removeData: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.uninstallSynapse(
            `synapse-${input.pluginId}`,
            input.removeData
          );
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              installed: false,
              enabled: false,
              containerStatus: "not_installed",
              hostPort: null,
              containerId: null,
            });
          }
          return result;
        }),

      status: publicProcedure
        .input(z.object({ pluginId: z.number() }))
        .query(async ({ input }) => {
          return pluginDocker.getSynapseStatus(`synapse-${input.pluginId}`);
        }),

      logs: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          tail: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return pluginDocker.getSynapseLogs(`synapse-${input.pluginId}`, input.tail);
        }),

      createAdmin: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          username: z.string().min(1),
          password: z.string().min(8),
        }))
        .mutation(async ({ input }) => {
          return pluginDocker.createSynapseAdmin(
            `synapse-${input.pluginId}`,
            input.username,
            input.password
          );
        }),

      getConfig: publicProcedure
        .input(z.object({ pluginId: z.number() }))
        .query(async ({ input }) => {
          return pluginDocker.getSynapseConfig(`synapse-${input.pluginId}`);
        }),
    }),

    // Docker 状态检查
    checkDocker: publicProcedure.query(async () => {
      return pluginDocker.checkDockerAvailable();
    }),

    // 通用插件容器管理 API
    container: router({
      // 安装插件
      install: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
          config: z.record(z.string(), z.unknown()),
        }))
        .mutation(async ({ input }) => {
          const plugin = await db.getPluginById(input.pluginId);
          if (!plugin) {
            throw new Error("Plugin not found");
          }

          const result = await pluginDocker.installPlugin(
            `plugin-${input.pluginId}`,
            input.definitionId,
            input.config as Record<string, any>
          );

          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              installed: true,
              enabled: true,
              containerStatus: "running",
              hostPort: result.port,
              containerId: result.containerId,
              pluginConfig: input.config as Record<string, unknown>,
            });
          }

          return result;
        }),

      // 启动插件
      start: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
        }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.startPlugin(
            `plugin-${input.pluginId}`,
            input.definitionId
          );
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              enabled: true,
              containerStatus: "running",
            });
          }
          return result;
        }),

      // 停止插件
      stop: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
        }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.stopPlugin(
            `plugin-${input.pluginId}`,
            input.definitionId
          );
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              enabled: false,
              containerStatus: "stopped",
            });
          }
          return result;
        }),

      // 卸载插件
      uninstall: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
          removeData: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
          const result = await pluginDocker.uninstallPlugin(
            `plugin-${input.pluginId}`,
            input.definitionId,
            input.removeData
          );
          if (result.success) {
            await db.updatePlugin(input.pluginId, {
              installed: false,
              enabled: false,
              containerStatus: "not_installed",
              hostPort: null,
              containerId: null,
            });
          }
          return result;
        }),

      // 获取插件状态
      status: publicProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
        }))
        .query(async ({ input }) => {
          return pluginDocker.getPluginStatus(
            `plugin-${input.pluginId}`,
            input.definitionId
          );
        }),

      // 获取插件日志
      logs: protectedProcedure
        .input(z.object({
          pluginId: z.number(),
          definitionId: z.string(),
          tail: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return pluginDocker.getPluginLogs(
            `plugin-${input.pluginId}`,
            input.definitionId,
            input.tail
          );
        }),

      // 获取插件配置
      getConfig: publicProcedure
        .input(z.object({ pluginId: z.number() }))
        .query(async ({ input }) => {
          return pluginDocker.getPluginConfig(`plugin-${input.pluginId}`);
        }),
    }),

    // 获取插件注册表（可安装的插件列表）
    registry: publicProcedure.query(async () => {
      const { getAllPluginDefinitions } = await import("./pluginRegistry");
      return getAllPluginDefinitions();
    }),
  }),

  skills: router({
    list: publicProcedure.query(async () => {
      return db.getAllSkills();
    }),

    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        provider: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const allSkills = await db.getAllSkills();
        return allSkills.filter((skill) => {
          if (input.query) {
            const query = input.query.toLowerCase();
            if (
              !skill.displayName.toLowerCase().includes(query) &&
              !skill.description?.toLowerCase().includes(query)
            ) {
              return false;
            }
          }
          if (input.category && skill.category !== input.category) {
            return false;
          }
          if (input.provider && skill.provider !== input.provider) {
            return false;
          }
          return true;
        });
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSkillById(input.id);
      }),

    getInstalled: publicProcedure
      .input(z.object({ instanceId: z.number() }))
      .query(async ({ input }) => {
        return db.getInstalledSkillsByInstanceId(input.instanceId);
      }),

    install: publicProcedure
      .input(z.object({
        instanceId: z.number(),
        skillId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const installed = await db.createInstalledSkill({
          instanceId: input.instanceId,
          skillId: input.skillId,
          status: "installing",
        });

        try {
          // Get skill details
          const skill = await db.getSkillById(input.skillId);
          if (!skill) {
            throw new Error("Skill not found");
          }

          // Install skill to Docker instance
          // Get skill content from metadata or create a simple SKILL.md file
          const skillContent = (skill.metadata as any)?.content || `# ${skill.displayName}\n\n${skill.description || ""}\n\nCategory: ${skill.category || "Unknown"}\nAuthor: ${skill.author || "Unknown"}\nSource: ${skill.sourceUrl || "N/A"}`;
          
          const result = await docker.installSkillToInstance(
            input.instanceId.toString(),
            skill.name,
            skillContent
          );

          if (!result.success) {
            throw new Error(result.error || "Failed to install skill");
          }

          // Restart container to apply skills
          const instance = await db.getInstanceById(input.instanceId);
          if (instance && instance.status === "running") {
            // Stop and start to reload skills
            await docker.stopInstance(input.instanceId.toString());
            await docker.startInstance(input.instanceId.toString());
          }

          // Mark as installed
          await db.updateInstalledSkill(installed.id, {
            status: "installed",
          });

          await db.incrementSkillDownloadCount(input.skillId);
          return { success: true };
        } catch (error) {
          // Mark as failed
          await db.updateInstalledSkill(installed.id, {
            status: "failed",
          });
          throw error;
        }
      }),

    installBatch: publicProcedure
      .input(z.object({
        instanceId: z.number(),
        skillIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        const results = [];
        for (const skillId of input.skillIds) {
          try {
            const installed = await db.createInstalledSkill({
              instanceId: input.instanceId,
              skillId,
              status: "installing",
            });
            await db.incrementSkillDownloadCount(skillId);
            await db.updateInstalledSkill(installed.id, { status: "installed" });
            results.push({ skillId, success: true });
          } catch (error) {
            results.push({ skillId, success: false, error: String(error) });
          }
        }
        return { results };
      }),

  uninstall: publicProcedure
    .input(z.object({
      instanceId: z.number(),
      skillId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const installed = await db.getInstalledSkill(input.instanceId, input.skillId);
      if (!installed) {
        throw new Error("Skill not installed");
      }

      await db.updateInstalledSkill(installed.id, { status: "uninstalling" });
      
      // TODO: Implement actual uninstallation logic
      // For now, delete immediately
      await db.deleteInstalledSkill(installed.id);
      return { success: true };
    }),

  updateConfig: publicProcedure
    .input(z.object({
      instanceId: z.number(),
      skillId: z.number(),
      config: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ input }) => {
      const installed = await db.getInstalledSkill(input.instanceId, input.skillId);
      if (!installed) {
        throw new Error("Skill not installed");
      }

      await db.updateInstalledSkill(installed.id, { config: input.config });
      return { success: true };
    }),

  sync: publicProcedure.mutation(async () => {
    try {
      await syncSkills();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to sync skills: ${String(error)}`);
    }
  }),

  createCustom: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      content: z.string().min(1),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    // Create custom skill with provider='custom'
    const skill = await db.createSkill({
      name: input.name,
      displayName: input.name,
      description: input.description ?? '',
      provider: 'custom',
      author: 'Custom',
      category: input.category ?? 'general',
      sourceUrl: '',
      downloadCount: 0,
      rating: 0,
      tags: input.tags ?? [],
      metadata: { content: input.content },
    });
    return skill;
  }),

  updateCustom: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      content: z.string().min(1).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const skill = await db.getSkillById(id);
      if (!skill || skill.provider !== 'custom') {
        throw new Error('Skill not found or not a custom skill');
      }

      const metadata = skill.metadata || {};
      if (input.content) {
        metadata.content = input.content;
      }

      await db.updateSkill(id, {
        name: updates.name,
        displayName: updates.name,
        description: updates.description,
        category: updates.category,
        tags: updates.tags,
        metadata,
      });
      return { success: true };
    }),

  importCustom: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      content: z.string().min(1),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Check if skill with same name already exists
      const allSkills = await db.getAllSkills();
      const existing = allSkills.find(s => s.name === input.name && s.provider === 'custom');
      
      if (existing) {
        throw new Error(`A custom skill with name "${input.name}" already exists`);
      }

      // Create custom skill
      const skill = await db.createSkill({
        name: input.name,
        displayName: input.name,
        description: input.description ?? '',
        provider: 'custom',
        author: 'Custom',
        category: input.category ?? 'general',
        sourceUrl: '',
        downloadCount: 0,
        rating: 0,
        metadata: { content: input.content },
      });
      return skill;
    }),

  deleteCustom: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const skill = await db.getSkillById(input.id);
      if (!skill || skill.provider !== 'custom') {
        throw new Error('Skill not found or not a custom skill');
      }

      await db.deleteSkill(input.id);
      return { success: true };
    }),

  recordUsage: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.recordSkillUsage(input.id);
      return { success: true };
    }),

  updateTags: publicProcedure
    .input(z.object({
      id: z.number(),
      tags: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const skill = await db.getSkillById(input.id);
      if (!skill || skill.provider !== 'custom') {
        throw new Error('Skill not found or not a custom skill');
      }

      await db.updateSkill(input.id, { tags: input.tags });
      return { success: true };
    }),

}),

  collections: router({
    list: publicProcedure.query(async ({ ctx }) => {
      // If user is logged in, return their collections; otherwise return empty array
      if (!ctx.user) return [];
      return db.getSkillCollectionsByUserId(ctx.user.id);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getSkillCollectionById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      skillIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createSkillCollection({
        userId: ctx.user.id,
        name: input.name,
        description: input.description ?? undefined,
        skillIds: input.skillIds,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      skillIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      if (Object.keys(updates).length > 0) {
        await db.updateSkillCollection(id, updates);
      }
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteSkillCollection(input.id);
      return { success: true };
    }),
}),
});

export type AppRouter = typeof appRouter;
