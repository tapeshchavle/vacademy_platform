import axios from "axios";
import { urlOpenLevels } from "@/constants/urls";

export interface OpenLevel {
    id: string;
    level_name: string;
    status?: string;
    duration_in_days?: number;
    thumbnail_file_id?: string;
    [key: string]: any;
}

export type LevelNameToIdMap = Record<string, string>;

export const getOpenLevels = async (instituteId: string): Promise<OpenLevel[]> => {
    const response = await axios.get<OpenLevel[]>(urlOpenLevels, {
        params: { instituteId },
    });
    return response.data || [];
};

export const buildLevelNameToIdMap = (levels: OpenLevel[]): LevelNameToIdMap => {
    const map: LevelNameToIdMap = {};
    for (const level of levels) {
        const name = (level.level_name || "").trim().toLowerCase();
        if (name) map[name] = level.id;
    }
    return map;
};
