import axios from "axios";

export class KitService {
  private apiKey: string;
  private baseUrl: string = "https://api.kit.com/v4";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.validateApiKey();
  }

  private validateApiKey(): void {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("Kit.com API key is required");
    }
    // Kit.com API keys are typically long strings
    if (this.apiKey.length < 10) {
      throw new Error("Kit.com API key appears to be invalid (too short)");
    }
  }

  async createBroadcastDraft(
    subject: string,
    content: string,
    previewText: string
  ): Promise<Record<string, unknown>> {
    // Create broadcast object according to Kit.com API v4 spec
    // Note: email_template_id is optional - Kit.com will use account default if not specified
    const broadcast = {
      subject: subject.trim(),
      content: content.trim(),
      preview_text: previewText.trim(),
      description: `theboring.app Newsletter - ${subject}`,
      public: false, // Keep as draft
      // Don't specify email_template_id to use account default template
    };

    try {
      console.log("Creating Kit.com broadcast with:", {
        subject: broadcast.subject,
        previewText: broadcast.preview_text,
        contentLength: broadcast.content.length,
        apiKeyLength: this.apiKey.length,
      });

      const response = await axios.post(
        `${this.baseUrl}/broadcasts`,
        broadcast,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Kit-Api-Key": this.apiKey,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("Kit.com API Response:", response.status, response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Kit.com API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: `${this.baseUrl}/broadcasts`,
        requestData: broadcast,
        headers: error.config?.headers,
      });

      // Handle specific Kit.com API errors based on documentation
      if (error.response?.status === 401) {
        throw new Error(
          "Invalid Kit.com API key or insufficient permissions. Please check your API key in settings."
        );
      } else if (error.response?.status === 413) {
        throw new Error("Request too large - reduce newsletter content size");
      } else if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors || [
          "Invalid data provided",
        ];
        throw new Error(`Validation error: ${errorDetails.join(", ")}`);
      } else if (error.response?.status === 403) {
        throw new Error(
          "Account access denied. Your Kit.com account may not have API access or trial may have lapsed."
        );
      } else if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(", "));
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timeout - Kit.com API took too long to respond"
        );
      } else if (error.code === "ENOTFOUND") {
        throw new Error(
          "Cannot connect to Kit.com API - check your internet connection"
        );
      }

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

  async listEmailTemplates(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.baseUrl}/email_templates`, {
        headers: {
          "X-Kit-Api-Key": this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error listing email templates:", error);
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
      // Don't specify email_template_id to use account default template
    };

    return JSON.stringify(importData, null, 2);
  }
}

// Helper function to extract Kit.com token from request headers
export function extractKitToken(request: Request): string {
  const kitHeader = request.headers.get("X-Kit-Token");
  if (!kitHeader) {
    throw new Error("Missing Kit.com API token in request headers");
  }
  return kitHeader.trim();
}
