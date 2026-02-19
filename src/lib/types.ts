export interface Section {
  type: "notes" | "checklist" | "links" | "text";
  title: string;
  content?: string;
  items?: string[];
  links?: { label: string; url: string }[];
}
