# Google Workspace MCP Server

MCP server for Google Slides, Sheets, Docs, and Drive. Enables AI assistants to create, read, and modify Google Workspace documents programmatically.

## Quick Start

```bash
npm install
npm run build
npm run get-token  # One-time OAuth setup
npm start
```

## Configuration

### Required Environment Variables

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### Optional Module Toggles

All modules enabled by default. Set to `false` to disable:

```
ENABLE_SHEETS=false
ENABLE_SLIDES=false
ENABLE_DOCS=false
ENABLE_REVISIONS=false
```

Drive tools are always enabled (core functionality).

### Claude Code Configuration

Add to your MCP settings:

```json
{
  "mcpServers": {
    "google-workspace-mcp": {
      "command": "node",
      "args": ["/path/to/google-workspace-mcp/build/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret",
        "GOOGLE_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

## Available Tools

### Drive (always enabled)
| Tool | Description |
|------|-------------|
| `create_folder` | Create a folder in Google Drive |
| `list_files` | List files/folders with filtering, pagination, and sorting. Supports Shared Drives. |
| `get_file` | Get detailed metadata for a specific file (permissions, capabilities, owners) |
| `search_files` | Search Drive using query syntax (e.g., `name contains 'report'`) |
| `export_file` | Export Google Docs/Sheets/Slides to PDF, text, CSV, docx, etc. |

### Sheets
| Tool | Description |
|------|-------------|
| `create_spreadsheet` | Create a new spreadsheet |
| `get_spreadsheet` | Get spreadsheet metadata |
| `get_sheet_values` | Read cell values |
| `update_sheet_values` | Write cell values |
| `batch_update_spreadsheet` | Apply formatting/structural changes |
| `append_sheet_values` | Append rows |
| `summarize_spreadsheet` | Extract all data |
| `copy_sheet` | Copy sheet between spreadsheets |

### Slides
| Tool | Description |
|------|-------------|
| `create_presentation` | Create a new presentation |
| `get_presentation` | Get presentation metadata |
| `batch_update_presentation` | Apply updates to slides |
| `get_page` | Get specific slide details |
| `summarize_presentation` | Extract text from all slides |

### Docs
| Tool | Description |
|------|-------------|
| `create_document` | Create a new document |
| `get_document` | Get document content |
| `batch_update_document` | Insert/delete/format text |
| `summarize_document` | Extract text content |

### Version History
| Tool | Description |
|------|-------------|
| `list_revisions` | List document version history |
| `get_revision` | Get revision details with restore instructions |

## Security

### OAuth Scopes

This server requests the minimum scopes needed:

| Scope | Purpose |
|-------|---------|
| `presentations` | Create/edit Google Slides |
| `spreadsheets` | Create/edit Google Sheets |
| `documents` | Create/edit Google Docs |
| `drive.readonly` | Browse, search, and read file metadata (including Shared Drives) |
| `drive.file` | Export and manage files created by this app |

### What This Server CAN Access
- All Slides presentations in your account
- All Sheets spreadsheets in your account
- All Docs documents in your account
- Drive file metadata, browsing, and search (including Shared Drives)
- Export Google Workspace files to other formats (PDF, text, CSV, etc.)

### What This Server CANNOT Access
- Gmail, Calendar, or other Google services
- Delete or permanently modify files you don't own
- Your Google account password or 2FA settings

### Security Best Practices
1. Never commit `.env` files to version control
2. Use a dedicated Google Cloud project for this server
3. Review access at [Google Account Permissions](https://myaccount.google.com/permissions)
4. Regenerate tokens with `npm run get-token` if compromised

## OAuth Setup

### 1. Enable APIs

In [Google Cloud Console](https://console.cloud.google.com/):
1. Create or select a project
2. Enable: Slides API, Sheets API, Docs API, Drive API

### 2. Create Credentials

1. Go to APIs & Services > Credentials
2. Create OAuth client ID (Desktop app type)
3. Download client ID and secret

### 3. Configure Consent Screen

Add these scopes:
- `https://www.googleapis.com/auth/presentations`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/documents`
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.file`

### 4. Generate Refresh Token

```bash
# Add client ID and secret to .env first
npm run get-token
```

The refresh token is generated once and stored. Regenerate only if:
- You change OAuth scopes
- You revoke access from your Google account
- You need to use a different account

## Troubleshooting

### "Request had insufficient authentication scopes"

1. Verify all 5 scopes are in your OAuth consent screen
2. Regenerate token: `npm run get-token`
3. Restart the MCP server

### "API has not been used in project"

Enable the missing API in Google Cloud Console. The error message includes a direct link.

### One service works but another doesn't

The token was generated without all scopes. Add missing scopes to consent screen and regenerate with `npm run get-token`.

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run lint         # Run ESLint
npm test             # Run tests
npm run get-token    # Generate OAuth token
```

## Testing with MCP Inspector

```bash
export $(cat .env | xargs) && npx @modelcontextprotocol/inspector node build/index.js
```

## License

ISC
