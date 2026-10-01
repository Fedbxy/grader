// What a form-submitting server action resolves to. Success is an explicit
// value rather than a redirect, because a redirect and a request that never
// reached the server (blocked by a firewall, say) both resolve to undefined
// on the client — and only one of them saved anything.
export type ActionResult =
    | { error: string; redirectTo?: never }
    | { redirectTo: string; error?: never };
