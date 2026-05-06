import { PatchNoteSection } from "./patch-note-section-model";

export interface PatchNoteModel {
  id?: number;
  version: string;
  releaseDate: string;
  published?: boolean;
  system: number;
  sections: PatchNoteSection[];
}