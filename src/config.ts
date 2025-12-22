/**
 * Configuration for enabling/disabling tool modules.
 * All tools are enabled by default. Set environment variables to 'false' to disable.
 *
 * Example: ENABLE_SHEETS=false will disable all Sheets tools.
 */
export const CONFIG = {
  // Drive tools are always enabled (core functionality)
  enableDrive: true,

  // Optional modules - all enabled by default
  enableSheets: process.env.ENABLE_SHEETS !== 'false',
  enableSlides: process.env.ENABLE_SLIDES !== 'false',
  enableDocs: process.env.ENABLE_DOCS !== 'false',
  enableRevisions: process.env.ENABLE_REVISIONS !== 'false',
};

/**
 * Returns a summary of which modules are enabled.
 * Useful for startup logging.
 */
export const getEnabledModules = (): string[] => {
  const modules: string[] = ['drive'];
  if (CONFIG.enableSheets) modules.push('sheets');
  if (CONFIG.enableSlides) modules.push('slides');
  if (CONFIG.enableDocs) modules.push('docs');
  if (CONFIG.enableRevisions) modules.push('revisions');
  return modules;
};
