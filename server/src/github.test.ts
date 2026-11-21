// Verifies the GitHub publishing path against a local fake of the Git Data API.
import { assert, assertEquals } from 'jsr:@std/assert@1';

Deno.test('publishing commits generated files in one commit', async () => {
  const calls: { method: string; path: string; body?: Record<string, unknown> }[] = [];
  let treeCounter = 0;
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    const url = new URL(req.url); const body = req.method === 'GET' ? undefined : await req.json();
    calls.push({ method: req.method, path: url.pathname, body });
    const j = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json' } });
    if (!req.headers.get('authorization')?.startsWith('Bearer tok')) return j({ message: 'bad creds' }, 401);
    if (req.method === 'GET' && url.pathname.endsWith('/git/ref/heads/main')) return j({ object: { sha: 'parent1' } });
    if (req.method === 'GET' && url.pathname.endsWith('/git/commits/parent1')) return j({ sha: 'parent1', tree: { sha: 'tree0' } });
    if (req.method === 'POST' && url.pathname.endsWith('/git/blobs')) return j({ sha: 'blob' + calls.length });
    if (req.method === 'POST' && url.pathname.endsWith('/git/trees')) return j({ sha: 'tree' + (++treeCounter) });
    if (req.method === 'POST' && url.pathname.endsWith('/git/commits')) return j({ sha: 'newcommit' });
    if (req.method === 'PATCH' && url.pathname.endsWith('/git/refs/heads/main')) return j({ ok: true });
    return j({ message: 'unexpected ' + req.method + ' ' + url.pathname }, 404);
  });
  Deno.env.set('GITHUB_API_URL', `http://localhost:${server.addr.port}`);
  Deno.env.set('GITHUB_TOKEN', 'tok'); Deno.env.set('GITHUB_REPO', 'owner/site'); Deno.env.set('GITHUB_BRANCH', 'main');
  const { commitFiles } = await import('./github.ts');

  const sha = await commitFiles([
    { path: 'src/data/generated/stories.json', content: '[]\n' },
    { path: 'src/assets/team/u1.jpg', content: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]) },
  ], 'content: story approved');

  assertEquals(sha, 'newcommit');
  const blobs = calls.filter((c) => c.path.endsWith('/git/blobs'));
  assertEquals(blobs.length, 1); // only the binary photo needs a blob; text goes inline in the tree
  assertEquals(blobs[0].body!.encoding, 'base64'); assertEquals(blobs[0].body!.content, '/9j/2Q==');
  const tree = calls.find((c) => c.path.endsWith('/git/trees'))!.body as { base_tree: string; tree: { path: string; content?: string }[] };
  assertEquals(tree.tree[0].content, '[]\n');
  assertEquals(tree.base_tree, 'tree0'); assertEquals(tree.tree.map((t) => t.path), ['src/data/generated/stories.json', 'src/assets/team/u1.jpg']);
  const commit = calls.find((c) => c.path.endsWith('/git/commits') && c.method === 'POST')!.body as { parents: string[]; message: string };
  assertEquals(commit.parents, ['parent1']); assert(commit.message.startsWith('content:'));
  assertEquals(calls.at(-1)!.method, 'PATCH'); // ref moved last, which is what triggers the deploy
  await server.shutdown();
});
