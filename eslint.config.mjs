import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next 16 bundles eslint-plugin-react-hooks v7, which adds React
// Compiler diagnostics (purity, refs, set-state-in-effect, ...) on top of
// rules-of-hooks / exhaustive-deps. They are all enabled.
export default defineConfig([
    ...nextCoreWebVitals,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"]),
]);
