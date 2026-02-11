import { api } from './api';

export enum GuildRole {
    Member = 0,
    Officer = 1,
    Leader = 2
}

// Restoration of interfaces
export interface GuildMember {
    id: number;
    guildId: number;
    userId: number;
    user: {
        id: number;
        name: string;
        avatarUrl?: string;
        level: number;
    };
    role: GuildRole;
    joinedAt: string;
    contributionXP: number;
}

export interface Guild {
    id: number;
    name: string;
    description?: string;
    leaderId: number;
    level: number;
    xp: number;
    capacity: number;
    createdAt: string;
    isPrivate: boolean;
    inviteCode?: string;
    members: GuildMember[];
}

export interface CreateGuildDto {
    name: string;
    description?: string;
    isPrivate?: boolean;
    inviteCode?: string;
}

export const guildAPI = {
    search: async (query: string = ''): Promise<Guild[]> => {
        const lcQuery = query ? `?query=${encodeURIComponent(query)}` : '';
        const response = await api.get<Guild[]>(`/guilds${lcQuery}`);
        return response.data;
    },

    get: async (id: number): Promise<Guild> => {
        const response = await api.get<Guild>(`/guilds/${id}`);
        return response.data;
    },

    create: async (data: CreateGuildDto): Promise<Guild> => {
        const response = await api.post<Guild>('/guilds', data);
        return response.data;
    },

    join: async (id: number, inviteCode?: string): Promise<void> => {
        await api.post(`/guilds/${id}/join`, { inviteCode });
    },

    leave: async (): Promise<void> => {
        await api.post(`/guilds/leave`);
    }
};
