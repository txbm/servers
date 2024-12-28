import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// ... other imports ...
import { checkBranchExists } from './utils.js';

// ... [rest of the imports and initial setup] ...

async function createPullRequest(
  owner: string,
  repo: string,
  options: z.infer<typeof CreatePullRequestOptionsSchema>
): Promise<GitHubPullRequest> {
  // Validate branch existence first
  const baseExists = await checkBranchExists(owner, repo, options.base, GITHUB_PERSONAL_ACCESS_TOKEN);
  const headExists = await checkBranchExists(owner, repo, options.head, GITHUB_PERSONAL_ACCESS_TOKEN);
  
  if (!baseExists) {
    throw new Error(`Base branch '${options.base}' does not exist in ${owner}/${repo}`);
  }
  if (!headExists) {
    throw new Error(`Head branch '${options.head}' does not exist in ${owner}/${repo}`);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "github-mcp-server",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...options,
        maintainer_can_modify: options.maintainer_can_modify ?? true,
      }),
    }
  );

  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage += `\\nDetails: ${errorData.message}`;
        if (errorData.errors) {
          errorMessage += `\\n${errorData.errors.map((e: any) => e.message).join('\\n')}`;
        }
      }
    } catch {
      // If we can't parse the error JSON, just use the statusText
    }
    throw new Error(errorMessage);
  }

  return GitHubPullRequestSchema.parse(await response.json());
}

// ... [rest of the file] ...