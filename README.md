# Google Workspace MCP Server

This project provides a Model Context Protocol (MCP) server for interacting with **Google Slides** and **Google Sheets** APIs, with built-in **automatic snapshot version control**. Create, read, and modify presentations and spreadsheets programmatically, with the safety of automatic backups before every modification.

## Features

- **Google Sheets**: Create, read, update, and manipulate spreadsheets
- **Google Slides**: Create and modify presentations (all existing functionality preserved)
- **Automatic Snapshots**: Every modification automatically creates a backup snapshot
- **Version Control**: List snapshots, revert to previous versions, manage backups
- **Safe by Default**: Snapshots created automatically (opt-out with `skipSnapshot: true`)

## Prerequisites

- Node.js (v18 or later recommended)
- npm (usually comes with Node.js)
- Google Cloud Project with APIs enabled (Slides, Sheets, Drive)
- OAuth 2.0 Credentials (Client ID and Client Secret)
- **Google Refresh Token** (one-time setup - see below)
- **Google Cloud CLI** (optional but recommended for debugging) - `brew install google-cloud-sdk`

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Set up Google OAuth** (see detailed setup below)

4. **Configure environment variables** in `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

5. **Run the server:**
   ```bash
   npm start
   ```

## Google Cloud Setup

### 1. Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/):
1. Create a new project or select an existing one
2. Navigate to "APIs & Services" > "Library"
3. Enable the following APIs:
   - **Google Slides API**
   - **Google Sheets API**
   - **Google Drive API**

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User type: "External" (or "Internal" for Workspace accounts)
   - Add app name, support email, developer contact
4. On the "Scopes" page, click "ADD OR REMOVE SCOPES" and add:
   - `https://www.googleapis.com/auth/presentations` (Slides access)
   - `https://www.googleapis.com/auth/spreadsheets` (Sheets access)
   - `https://www.googleapis.com/auth/drive.readonly` (Read Drive files)
   - `https://www.googleapis.com/auth/drive.file` (Create snapshots)
5. Complete consent screen setup
6. Back at "Credentials", create OAuth client ID:
   - Application type: "Desktop app"
   - Name: "Google Workspace MCP" (or your choice)
7. Copy your **Client ID** and **Client Secret**

### 3. Get Your Refresh Token (ONE-TIME SETUP)

**IMPORTANT**: The refresh token is generated **once** during initial setup. After you get it:
- Store it in your `.env` file or MCP settings
- The server will use it automatically for all future sessions
- You only need to regenerate it if you:
  - Change the OAuth scopes
  - Revoke access from your Google account
  - Need to use a different Google account

#### Option A: Using the Built-in Script (Recommended)

1. Add your Client ID and Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

2. Run the token generator:
   ```bash
   npm run get-token
   ```

3. Follow the prompts:
   - Browser will open to Google authorization page
   - Sign in and grant permissions
   - Your refresh token will be displayed in the terminal

4. Copy the refresh token to your `.env`:
   ```
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

#### Option B: Using OAuth 2.0 Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (Settings), check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In "Step 1", select these scopes:
   - `https://www.googleapis.com/auth/presentations`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.file`
5. Click "Authorize APIs" and sign in
6. In "Step 2", click "Exchange authorization code for tokens"
7. Copy the **Refresh token** to your `.env`

## MCP Configuration

Add to your MCP settings file (e.g., Claude Code settings):

```json
{
  "mcpServers": {
    "google-workspace-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/google-workspace-mcp/build/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret",
        "GOOGLE_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

Replace `/absolute/path/to/google-workspace-mcp` with the actual path to your installation.

## Available Tools

### Google Slides Tools

**Read Operations:**
- `create_presentation` - Create a new presentation
- `get_presentation` - Get presentation metadata and structure
- `get_page` - Get details about a specific slide
- `summarize_presentation` - Extract all text content for summarization

**Write Operations:**
- `batch_update_presentation` - Apply batch updates (creates snapshot first)
  - Optional parameter: `skipSnapshot: true` to disable automatic backup

### Google Sheets Tools

**Read Operations:**
- `create_spreadsheet` - Create a new spreadsheet
- `get_spreadsheet` - Get spreadsheet metadata and structure
- `get_sheet_values` - Read cell values from a range
- `summarize_spreadsheet` - Extract all data for summarization

**Write Operations** (all create snapshots automatically):
- `update_sheet_values` - Update cell values in a range
- `batch_update_spreadsheet` - Apply formatting/structural changes
- `append_sheet_values` - Append rows to a sheet

All write operations support `skipSnapshot: true` parameter to opt-out of automatic backups.

### Version Control Tools

- `create_snapshot` - Manually create a snapshot of any document
- `list_snapshots` - List all snapshots for a document
- `revert_to_snapshot` - Restore a previous version (creates backup first)
- `delete_snapshot` - Permanently delete a snapshot

## Snapshot Version Control

### How It Works

Every time you modify a document (Slides or Sheets), the server automatically:
1. Creates a copy of the current state in Google Drive
2. Stores metadata about the operation in the snapshot
3. Proceeds with your requested changes

Snapshots are stored with descriptive names like:
```
Sales Report_snapshot_2025-12-19T14-30-22_update_sheet_values
```

### Managing Snapshots

**List snapshots for a document:**
```json
{
  "tool": "list_snapshots",
  "documentId": "your_document_id"
}
```

**Revert to a previous version:**
```json
{
  "tool": "revert_to_snapshot",
  "originalDocumentId": "your_document_id",
  "snapshotId": "snapshot_file_id",
  "documentType": "spreadsheet"
}
```

**Delete old snapshots:**
```json
{
  "tool": "delete_snapshot",
  "snapshotId": "snapshot_file_id"
}
```

### Opting Out of Snapshots

For any write operation, add `skipSnapshot: true`:
```json
{
  "tool": "update_sheet_values",
  "spreadsheetId": "...",
  "range": "Sheet1!A1:B10",
  "values": [[1, 2], [3, 4]],
  "skipSnapshot": true
}
```

## Example Use Cases

### Automated QA Workbooks (Perfect for GitHub Actions!)

The Sheets tools are designed to be stateless and scriptable, making them ideal for CI/CD:

```javascript
// Create a test plan workbook
await create_spreadsheet({
  title: "Release 2.0 QA Plan",
  sheets: ["Test Cases", "Bug Tracking", "Sign-off"]
});

// Populate test cases
await update_sheet_values({
  spreadsheetId: "...",
  range: "Test Cases!A1:C1",
  values: [["Test ID", "Description", "Status"]]
});

// Append test results as they come in
await append_sheet_values({
  spreadsheetId: "...",
  range: "Test Cases!A2",
  values: [["TC-001", "Login flow", "PASS"]]
});
```

### Presentation Automation

```javascript
// Create monthly report presentation
await create_presentation({ title: "Q4 2024 Report" });

// Add slides with data visualization
await batch_update_presentation({
  presentationId: "...",
  requests: [/* slide creation requests */]
});

// Safe to experiment - snapshot created automatically!
```

### Collaborative Data Management

```javascript
// List all changes made to a spreadsheet
const snapshots = await list_snapshots({
  documentId: "shared_budget_spreadsheet_id"
});

// Revert if something went wrong
await revert_to_snapshot({
  originalDocumentId: "shared_budget_spreadsheet_id",
  snapshotId: snapshots[0].snapshotId,
  documentType: "spreadsheet"
});
```

## Troubleshooting

### Using gcloud CLI for Debugging

Install the Google Cloud CLI to quickly check your project configuration:

```bash
# Install (macOS)
brew install google-cloud-sdk

# Add to shell (add to ~/.zshrc for persistence)
source "$(brew --prefix)/share/google-cloud-sdk/path.zsh.inc"

# Initialize and login
gcloud init

# Check which APIs are enabled
gcloud services list --enabled | grep -i "sheets\|slides\|drive"
```

Expected output when all APIs are enabled:
```
drive.googleapis.com                 Google Drive API
sheets.googleapis.com                Google Sheets API
slides.googleapis.com                Google Slides API
```

### "Request had insufficient authentication scopes" errors

This is the most common issue. Check these **in order**:

1. **Are all 3 APIs enabled?** Run:
   ```bash
   gcloud services list --enabled | grep -i "sheets\|slides\|drive"
   ```
   If any are missing, enable them:
   ```bash
   gcloud services enable sheets.googleapis.com
   gcloud services enable slides.googleapis.com
   gcloud services enable drive.googleapis.com
   ```

2. **Are all 4 scopes in your OAuth consent screen?**
   - Go to: APIs & Services > OAuth consent screen > Edit App > Scopes
   - You need ALL of these:
     - `https://www.googleapis.com/auth/presentations`
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.file`

3. **Did you regenerate the token AFTER adding scopes?**
   - This is critical: scopes are baked into the refresh token at generation time
   - If you add scopes later, you MUST regenerate: `npm run get-token`

### "API has not been used in project" errors

The API needs to be enabled in Google Cloud Console. The error message includes a direct link - click it to enable the API, wait 1-2 minutes for propagation, then retry.

### "Invalid grant" or "Token expired" errors
- Your refresh token may be invalid
- Re-run `npm run get-token` to get a new one
- Check that all 4 OAuth scopes are enabled

### Slides works but Sheets doesn't (or vice versa)

This usually means the `spreadsheets` (or `presentations`) scope wasn't in your OAuth consent screen when you generated the token:

1. Add the missing scope to OAuth consent screen
2. Regenerate your token: `npm run get-token`
3. Update your config/env with the new token
4. Restart the MCP server

### Snapshots not being created
- Verify `drive.file` scope is enabled
- Check that you haven't set `skipSnapshot: true`
- Look for warning messages in server logs

### Permission denied errors
- Ensure all 4 APIs are enabled in Google Cloud Console
- Verify your OAuth consent screen has all required scopes
- Check that the refresh token was generated with all scopes

## FAQ

### Why do I need to regenerate my token after adding scopes?

OAuth refresh tokens encode the scopes they were granted at creation time. If you add new scopes to your OAuth consent screen, existing tokens don't automatically gain access to them. You must generate a new token that includes the new scopes.

### Can I use the same token across multiple machines?

Yes! The refresh token is tied to your Google account and OAuth app, not your machine. Copy the same `GOOGLE_REFRESH_TOKEN` to any machine where you want to use this MCP server.

### How do I know which scopes my current token has?

The easiest way is to test each feature. If Slides works but Sheets fails with "insufficient scopes", your token is missing the Sheets scope. Use `npm run get-token` to generate a fresh token with all scopes.

### Why is the gcloud CLI recommended?

It makes debugging much faster. Instead of clicking through the Google Cloud Console UI, you can quickly check:
- Which project you're using
- Which APIs are enabled
- Your current authentication status

### The token generator opens a browser but nothing happens

Make sure you're logged into the correct Google account. If you have multiple accounts, the browser may be defaulting to a different one. Try using an incognito window or explicitly signing out first.

## Testing with MCP Inspector

You can test the MCP server directly using the MCP Inspector without needing Claude:

```bash
cd /Users/path/to/google-workspace-mcp
export $(cat .env | xargs) && npx @modelcontextprotocol/inspector node build/index.js
```

This opens a web UI where you can:
- Browse all available tools
- Execute tools with custom parameters
- See raw JSON responses
- Debug issues before integrating with Claude

This is useful for verifying your OAuth setup is working correctly.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run linter
npm run lint

# Start server
npm start

# Generate new refresh token
npm run get-token
```

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- The `drive.file` scope only allows access to files created by this app
- Snapshots are stored in your Google Drive - you control them
- Refresh tokens should be treated like passwords

## License

ISC

## Contributing

Issues and pull requests welcome! This MCP server is designed to be extended with additional Google Workspace services (Docs, Forms, etc.) in the future.

## Version History

- **0.2.0** - Added Google Sheets support and automatic snapshot version control
- **0.1.0** - Initial release with Google Slides support
