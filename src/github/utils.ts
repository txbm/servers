/**
 * Utility functions for GitHub API operations
 */

export async function checkBranchExists(
  owner: string,
  repo: string,
  branchName: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branchName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "github-mcp-server",
        },
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}
