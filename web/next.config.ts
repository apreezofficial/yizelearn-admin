import path from 'node:path';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // The native and web admins share framework-independent learning data and CSV validation.
  turbopack: {root: path.resolve(__dirname, '..')},
};

export default nextConfig;
