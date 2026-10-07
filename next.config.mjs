/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        serverActions: {
            // Server Actions reject bodies over 1 MB by default, and since Next 15
            // that includes file uploads. The largest request is creating a
            // problem with a statement (10 MB) and a testcase archive (100 MB),
            // per src/config/limits.ts, plus room for the form fields.
            bodySizeLimit: "111mb",
        },
    },
};

export default nextConfig;
