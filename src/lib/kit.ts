import axios from "axios";
import { KitBroadcast } from "@/types";

export class KitService {
  private apiKey: string;
  private baseUrl: string = "https://api.kit.com/v4";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createBroadcastDraft(
    subject: string,
    content: string,
    previewText: string
  ): Promise<Record<string, unknown>> {
    const broadcast: KitBroadcast = {
      email_template_id: parseInt(process.env.KIT_EMAIL_TEMPLATE_ID || "2"),
      content,
      description: `theboring.app Newsletter - ${subject}`,
      public: false, // Keep as draft
      published_at: new Date().toISOString(),
      preview_text: previewText,
      subject,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/broadcasts`,
        broadcast,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Kit-Api-Key": this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating Kit broadcast:", error);
      throw error;
    }
  }

  async listBroadcasts(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.baseUrl}/broadcasts`, {
        headers: {
          "X-Kit-Api-Key": this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error listing broadcasts:", error);
      throw error;
    }
  }

  generateImportableContent(
    subject: string,
    content: string,
    previewText: string
  ): string {
    // Generate a JSON that can be imported to Kit.com
    const importData = {
      subject,
      preview_text: previewText,
      content,
      description: `theboring.app Newsletter - ${subject}`,
      public: false,
      email_template_id: parseInt(process.env.KIT_EMAIL_TEMPLATE_ID || "2"),
    };

    return JSON.stringify(importData, null, 2);
  }
}

// Helper function to extract Kit.com token from request headers
export function extractKitToken(request: Request): string {
  const kitHeader = request.headers.get("X-Kit-Token");
  if (!kitHeader) {
    throw new Error("Missing or invalid Kit.com token");
  }
  return kitHeader;
}
