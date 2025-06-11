# Newsletter Builder for theboring.app

An AI-powered newsletter builder that helps you create weekly newsletters by saving interesting links throughout the week and using AI to generate cohesive content.

## Features

- 📝 **Link Management**: Save interesting AI tools, models, and articles with categories and descriptions
- 🤖 **AI-Powered Generation**: Use OpenAI GPT-4 to generate newsletter content from your saved links and thoughts
- 📧 **Kit.com Integration**: Create drafts directly in Kit.com or export for manual import
- 💾 **GitHub Storage**: Uses GitHub as a free backend storage solution
- 🎨 **Clean UI**: Modern, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS v4
- **Storage**: GitHub API (files stored as JSON in a GitHub repository)
- **AI**: OpenAI GPT-4 for content generation
- **Email**: Kit.com API integration
- **Deployment**: Vercel-ready (serverless functions)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd newsletter-builder
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# GitHub Configuration (for storage)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=newsletter-data
GITHUB_BRANCH=main

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Kit.com Configuration (Optional)
KIT_API_KEY=your_kit_api_key
KIT_EMAIL_TEMPLATE_ID=2

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Storage Repository

1. Create a new **public** repository on GitHub called `newsletter-data` (or whatever you named it in `GITHUB_REPO`)
2. Generate a Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Create a token with `repo` permissions
   - Use this token as `GITHUB_TOKEN`

### 4. Get API Keys

**OpenAI (Required):**
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it as `OPENAI_API_KEY`

**Kit.com (Optional - for direct publishing):**
1. Get your API key from [Kit.com API settings](https://app.kit.com/account_settings/api)
2. Add it as `KIT_API_KEY`
3. Find your email template ID (usually 2 for the default template)

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app!

## How to Use

### 1. Save Links Throughout the Week
- Navigate to **"Save Links"**
- Add URLs of interesting AI tools, models, or articles you discover
- Categorize them (Tool/Model/Article/Other) and add descriptions
- Links are automatically saved to your GitHub repository

### 2. Build Your Newsletter
- Go to **"Build Newsletter"**
- Review and select which saved links to include
- Add your weekly thoughts and insights in the text area
- Click **"Generate Newsletter"** to create AI-powered content
- Preview the generated newsletter in real-time

### 3. Export and Send
- Visit **"Export & Send"**
- Choose your newsletter from the list
- Configure subject line and preview text
- Choose export method:
  - **Create Kit.com Draft**: Automatically creates a draft in your Kit.com account
  - **Download File**: Get a JSON file for manual import to any email platform
  - **Copy to Clipboard**: Copy HTML content for any email editor

## File Structure

The app stores data in your GitHub repository with this structure:

```
your-newsletter-data-repo/
├── links/
│   └── 2025/
│       └── 01/           # Month-based organization
│           └── links.json
└── newsletters/
    └── 2025-W03/         # Week-based organization
        └── newsletter.json
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect the repository to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel's dashboard
4. Deploy!

The app uses serverless functions and works perfectly on Vercel's free tier.

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- Any platform supporting Node.js

## Newsletter Template

The AI generates newsletters with this structure:

- **🛠️ AI Tools Worth Checking Out**: New AI tools you've saved
- **🤖 New AI Models to Explore**: Latest AI models  
- **📚 Interesting Reads**: Articles and other content
- **💭 Weekly Learnings & Insights**: Your condensed thoughts and reflections

## Customization

### Change AI Writing Style
Edit the system prompt in `src/lib/openai.ts` to modify the AI's tone, style, or newsletter structure.

### Modify UI and Styling  
The app uses Tailwind CSS v4. Update styles in `src/app/globals.css` or individual component files.

### Add New Link Categories
Update the `SavedLink` type in `src/types/index.ts` to add new categories beyond Tool/Model/Article/Other.

### Use Different AI Models
Change the model in `src/lib/openai.ts` (currently set to `gpt-4`). You can use `gpt-3.5-turbo` for lower costs.

## Troubleshooting

### Styling Issues
- Make sure Tailwind CSS is working by checking if basic utility classes apply
- Try clearing Next.js cache: `rm -rf .next` and `npm run dev`

### GitHub API Issues
- Ensure your repository is public or your token has sufficient permissions
- Verify `GITHUB_OWNER` and `GITHUB_REPO` environment variables are correct
- Check that your Personal Access Token hasn't expired

### OpenAI Issues
- Verify your API key is valid and has available credits
- Check your OpenAI usage limits and billing status
- Try switching to `gpt-3.5-turbo` if `gpt-4` access is limited

### Kit.com Issues
- Verify your API key is active and valid
- Check that the email template ID exists in your Kit.com account
- Kit.com integration is optional - you can always export manually

## Contributing

This is an MVP with room for many improvements! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests
- Fork and customize for your own use

## License

MIT License - feel free to use this for your own projects! 