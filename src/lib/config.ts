declare const process: { env?: Record<string, string | undefined> } | undefined;
const env = typeof process !== 'undefined' ? process.env ?? {} : {};
export const businessOsMode = env.VITE_BUSINESS_OS_MODE ?? env.BUSINESS_OS_MODE ?? 'local';
export const localRole = env.VITE_LOCAL_ROLE ?? 'Owner';
export const isLocalMode = businessOsMode === 'local';
