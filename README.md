# Newsletter Builder for theboring.app

A streamlined AI-powered newsletter builder that helps you create weekly newsletters by saving interesting links throughout the week and using AI to generate cohesive content.

## Core Features

🔗 **Save Links**: Easily save interesting links as you discover them - AI tools, models, articles, and more. All stored securely in your GitHub repository.

📰 **Generate Newsletter**: Review your saved links, sort them by dragging and dropping, then let AI create a polished newsletter. Edit the content directly in the preview before exporting.

🤖 **Auto-Summary**: AI automatically creates concise summaries of your saved links using OpenAI, making them ready for newsletter inclusion.

📧 **Kit.com Integration**: Automatically create newsletter drafts directly in your Kit.com account with one click - no manual copying required.

📤 **Export Options**: Download as JSON for any email platform or copy to clipboard for manual pasting into any editor.

🗂️ **Archive Links**: After exporting a newsletter, archive the used links to start fresh for your next newsletter while keeping a clean workspace.

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd newsletter-builder
npm install
```

### 2. Setup Configuration

The app uses a simple settings interface - no environment files needed! Just run the app and configure through the settings page:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click the settings button to configure:

- **GitHub**: Personal access token, repository details for link storage
- **OpenAI**: API key for AI content generation and auto-summaries  
- **Kit.com**: API key for direct newsletter publishing (optional)

### 3. Set Up Storage Repository

1. Create a new repository on GitHub (e.g., `newsletter-data`)
2. Generate a Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Create a token with `repo` permissions
3. Add these details in the app's settings page

### 4. Get API Keys

**OpenAI (Required):**
- Get an API key from [OpenAI](https://platform.openai.com/api-keys)
- Add it in the settings page for AI content generation

**Kit.com (Optional):**
- Get your API key from [Kit.com API settings](https://app.kit.com/account_settings/api)  
- Add it in settings for direct newsletter publishing

## How to Use

### 1. 🔗 Save Links Throughout the Week
- Navigate to **"Links"** page
- Paste URLs of interesting content you discover
- Choose categories (Tool/Model/Article/Other)
- AI can automatically generate titles and summaries
- Links are saved to your GitHub repository

### 2. 📰 Generate Your Newsletter  
- Go to **"Build Newsletter"** page
- Select which saved links to include by checking them
- **Drag and drop** to reorder links in your preferred sequence
- Add your personal thoughts and insights (optional)
- Click **"Generate Newsletter"** for AI-powered content
- **Edit the preview directly** by clicking the "Edit" button
- Save changes and your edits are preserved

### 3. 📤 Export and Archive
- Choose your export method:
  - **Kit.com Draft**: Creates a draft directly in your Kit.com account
  - **Download JSON**: Get a file for manual import to any email platform  
  - **Copy to Clipboard**: Copy content for pasting into any editor
- **Archive used links** when prompted to start fresh for next week

## File Structure

The app organizes data in your GitHub repository:

```
your-newsletter-data-repo/
├── links/
│   └── 2025/
│       └── 01/           # Month-based organization
│           └── links.json
├── links/archive/
│   └── 2025/
│       └── 01/           # Archived links after newsletter export
│           └── archived-links.json
└── newsletters/
    └── 2025-W03/         # Week-based organization
        └── newsletter.json
```

## Newsletter Template

AI generates newsletters with this structure:

- **🛠️ AI Tools Worth Checking Out**: New AI tools you've saved
- **🤖 New AI Models to Explore**: Latest AI models
- **📚 Interesting Reads**: Articles and other content  
- **💭 Weekly Learnings & Insights**: Your personal thoughts and reflections

## Contributing

This is a focused, streamlined tool with room for improvements! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests
- Fork and customize for your own use
