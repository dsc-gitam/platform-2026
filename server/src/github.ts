// Commit files to the site repository in a single commit (Git Data API). A push to the
// configured branch triggers the GitHub Actions deploy workflow.
import { env } from './env.ts';

export type RepoFile = { path: string; content: string | Uint8Array };

const api = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${env.githubApi}/repos/${env.githubRepo}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${env.githubToken}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'content-type': 'application/json', 'user-agent': 'gdg-gitam-server', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
};

const toBase64 = (bytes: Uint8Array) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };

export const githubConfigured = () => !!(env.githubToken && env.githubRepo);

/** Returns the new commit sha, or null when nothing changed. */
export async function commitFiles(files: RepoFile[], message: string): Promise<string | null> {
  if (!githubConfigured()) throw new Error('GITHUB_TOKEN / GITHUB_REPO are not configured');
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ref = await api(`/git/ref/heads/${env.githubBranch}`);
      const parent: string = ref.object.sha;
      const parentCommit = await api(`/git/commits/${parent}`);
      // Text files go inline in the tree (no extra call); binaries (photos) are uploaded as blobs, all in parallel.
      const tree = await Promise.all(files.map(async (f) => {
        if (typeof f.content === 'string') return { path: f.path, mode: '100644', type: 'blob', content: f.content };
        const blob = await api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: toBase64(f.content), encoding: 'base64' }) });
        return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha };
      }));
      const newTree = await api('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }) });
      if (newTree.sha === parentCommit.tree.sha) return null; // identical content, no commit needed
      const commit = await api('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }) });
      await api(`/git/refs/heads/${env.githubBranch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
      return commit.sha as string;
    } catch (e) {
      if (attempt === 1) throw e; // retry once (branch moved while we were building the commit)
    }
  }
  return null;
}
