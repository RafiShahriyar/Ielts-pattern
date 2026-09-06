/** @type {import('next').NextConfig} */
const nextConfig = {
  // Electron loads the exported HTML from disk; there is no Node server at runtime.
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // Electron's window counts as a separate origin to the dev server;
  // without this Next 16 blocks the dev chunks and the app never hydrates.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
