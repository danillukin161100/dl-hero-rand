export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  global_name?: string | null;
}

export interface DiscordMember {
  user: DiscordUser;
  nick?: string | null;
  roles: string[];
  joined_at: string;
  avatar?: string | null;
}

export interface DiscordConfig {
  botToken: string;
  guildId: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// В режиме разработки используем Vite proxy, чтобы избежать CORS.
// В production (сборка) используем прямой URL к Discord API.
const API_BASE = import.meta.env.DEV
  ? "/api/discord"
  : "https://discord.com/api/v10";

export class DiscordApiService {
  private config: DiscordConfig | null = null;

  constructor(config?: DiscordConfig) {
    if (config) {
      this.config = config;
    } else {
      // В dev режиме env читаются из .env.local / .env
      // В production (сборка через CI/CD) подставляются из secrets репозитория
      const botToken = import.meta.env.VITE_DISCORD_BOT_TOKEN;
      const guildId = import.meta.env.VITE_DISCORD_GUILD_ID;

      if (botToken && guildId && botToken !== "placeholder" && guildId !== "placeholder") {
        this.config = { botToken, guildId };
      } else {
        console.warn(
          "[DiscordApiService] Discord API не инициализирован: " +
          "VITE_DISCORD_BOT_TOKEN или VITE_DISCORD_GUILD_ID не заданы. " +
          "При локальном деплое это нормально (secrets доступны только через GitHub Actions)."
        );
      }
    }
  }

  public configure(config: DiscordConfig): void {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    if (!this.config?.botToken) {
      throw new Error(
        "Bot token is not configured. Provide config in constructor, " +
          "call configure(), or set VITE_DISCORD_BOT_TOKEN in .env file.",
      );
    }

    return {
      Authorization: `Bot ${this.config.botToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Fetch all members of the configured Discord guild.
   * Handles pagination automatically (Discord API limit is 1000 members per request).
   */
  public async getGuildMembers(): Promise<ApiResult<DiscordMember[]>> {
    if (!this.config?.guildId) {
      return {
        success: false,
        error:
          "Guild ID is not configured. Provide config in constructor, " +
          "call configure(), or set VITE_DISCORD_GUILD_ID in .env file.",
      };
    }

    try {
      const members: DiscordMember[] = [];
      let hasMore = true;
      let after: string | undefined;

      while (hasMore) {
        const params = new URLSearchParams({ limit: "1000" });
        if (after) {
          params.set("after", after);
        }

        const response = await fetch(
          `${API_BASE}/guilds/${this.config.guildId}/members?${params}`,
          { headers: this.getHeaders() },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          return {
            success: false,
            error: `Discord API error (${response.status}): ${errorBody}`,
          };
        }

        const batch: DiscordMember[] = await response.json();
        members.push(...batch);

        // If we got fewer than 1000 members, we've reached the end
        if (batch.length < 1000) {
          hasMore = false;
        } else {
          // Set the 'after' cursor to the last member's ID for pagination
          after = batch[batch.length - 1].user.id;
        }
      }

      return { success: true, data: members };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: `Failed to fetch guild members: ${message}`,
      };
    }
  }

  /**
   * Fetch a single member by their user ID.
   */
  public async getGuildMember(
    userId: string,
  ): Promise<ApiResult<DiscordMember>> {
    if (!this.config?.guildId) {
      return {
        success: false,
        error:
          "Guild ID is not configured. Provide config in constructor, " +
          "call configure(), or set VITE_DISCORD_GUILD_ID in .env file.",
      };
    }

    try {
      const response = await fetch(
        `${API_BASE}/guilds/${this.config.guildId}/members/${userId}`,
        { headers: this.getHeaders() },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        return {
          success: false,
          error: `Discord API error (${response.status}): ${errorBody}`,
        };
      }

      const member: DiscordMember = await response.json();
      return { success: true, data: member };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: `Failed to fetch guild member: ${message}`,
      };
    }
  }

  /**
   * Get the display name for a member (nickname > global_name > username).
   */
  public static getDisplayName(member: DiscordMember): string {
    return member.nick || member.user.global_name || member.user.username;
  }

  /**
   * Get the avatar URL for a Discord user, or null if they have no avatar.
   */
  public static getAvatarUrl(
    user: DiscordUser,
    size: number = 128,
  ): string | null {
    if (!user.avatar) {
      return null;
    }

    const extension = user.avatar.startsWith("a_") ? "gif" : "webp";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=${size}`;
  }

  /**
   * Verify that the bot token is valid by fetching the current bot user.
   */
  public async verifyToken(): Promise<ApiResult<DiscordUser>> {
    try {
      const response = await fetch(`${API_BASE}/users/@me`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Token verification failed (${response.status})`,
        };
      }

      const user: DiscordUser = await response.json();
      return { success: true, data: user };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: `Verification error: ${message}` };
    }
  }
}
