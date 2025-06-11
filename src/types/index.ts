export interface SavedLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category: "tool" | "model" | "article" | "other";
  savedAt: string;
  selected: boolean;
}

export interface Thought {
  id: string;
  title: string;
  type: string;
  date: string;
  projectId?: string;
  content: string;
  selected: boolean;
}

export interface NewsletterData {
  week: string;
  links: SavedLink[];
  thoughts: Thought[];
  generatedContent?: string;
}

export interface KitBroadcast {
  email_template_id: number;
  email_address?: string;
  content: string;
  description: string;
  public: boolean;
  published_at?: string;
  send_at?: string;
  thumbnail_alt?: string;
  thumbnail_url?: string;
  preview_text: string;
  subject: string;
  subscriber_filter?: Record<string, unknown>[];
}
