import { text } from "@sveltejs/kit";
import { writable, type Writable } from "svelte/store"

export interface TaskInfo {
    text: string;
    completed: boolean;
    priority?: number;
    tags?: string[];
    deadline?: Date;
}

export const taskData: Writable<TaskInfo[]> = writable([]) 

export const allTags: Writable<string[]> = writable([])