import { useCallback, useMemo } from "react";

// ── usePosts ──
// Cheers and (in step 5) comments live on individual Post objects in
// state.posts. The feed itself is just the posts array, sorted desc.
// Auto-post-on-completion is wired in useGameState; this hook owns the
// social interactions on top of posts.
export function usePosts(state, setState) {
  const posts = state.posts || [];

  const cheerPost = useCallback(
    (postId) => {
      setState((prev) => ({
        ...prev,
        posts: (prev.posts || []).map((p) => {
          if (p.id !== postId) return p;
          if ((p.cheers || []).some((c) => c.userId === "me")) return p;
          return { ...p, cheers: [...(p.cheers || []), { userId: "me", at: Date.now() }] };
        }),
      }));
    },
    [setState]
  );

  const uncheerPost = useCallback(
    (postId) => {
      setState((prev) => ({
        ...prev,
        posts: (prev.posts || []).map((p) =>
          p.id !== postId
            ? p
            : { ...p, cheers: (p.cheers || []).filter((c) => c.userId !== "me") }
        ),
      }));
    },
    [setState]
  );

  const deletePost = useCallback(
    (postId) => {
      setState((prev) => ({
        ...prev,
        posts: (prev.posts || []).filter((p) => p.id !== postId),
      }));
    },
    [setState]
  );

  return useMemo(
    () => ({ posts, cheerPost, uncheerPost, deletePost }),
    [posts, cheerPost, uncheerPost, deletePost]
  );
}
