import { PatchNoteItem } from "./path-note-item-model";

export interface PatchNoteSection {
    id?: number;
    title: string;
    items: PatchNoteItem[];
}