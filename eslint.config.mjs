import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextCoreWebVitals,
    {
        // eslint-plugin-react-hooks v7 (bundled with eslint-config-next 16) adds
        // React Compiler diagnostics on top of rules-of-hooks / exhaustive-deps.
        // The app does not use the React Compiler and these did not exist in
        // eslint-config-next 15, so keep the previous effective rule set.
        rules: {
            "react-hooks/static-components": "off",
            "react-hooks/use-memo": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/incompatible-library": "off",
            "react-hooks/immutability": "off",
            "react-hooks/globals": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/error-boundaries": "off",
            "react-hooks/purity": "off",
            "react-hooks/set-state-in-render": "off",
            "react-hooks/unsupported-syntax": "off",
            "react-hooks/config": "off",
            "react-hooks/gating": "off",
        },
    },
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
