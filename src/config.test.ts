import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('enables all modules by default', async () => {
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableDrive).toBe(true);
    expect(CONFIG.enableSheets).toBe(true);
    expect(CONFIG.enableSlides).toBe(true);
    expect(CONFIG.enableDocs).toBe(true);
    expect(CONFIG.enableRevisions).toBe(true);
  });

  it('disables sheets when ENABLE_SHEETS=false', async () => {
    process.env.ENABLE_SHEETS = 'false';
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableSheets).toBe(false);
  });

  it('disables slides when ENABLE_SLIDES=false', async () => {
    process.env.ENABLE_SLIDES = 'false';
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableSlides).toBe(false);
  });

  it('disables docs when ENABLE_DOCS=false', async () => {
    process.env.ENABLE_DOCS = 'false';
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableDocs).toBe(false);
  });

  it('disables revisions when ENABLE_REVISIONS=false', async () => {
    process.env.ENABLE_REVISIONS = 'false';
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableRevisions).toBe(false);
  });

  it('keeps drive always enabled', async () => {
    // Drive should always be true regardless of env vars
    process.env.ENABLE_DRIVE = 'false';
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.enableDrive).toBe(true);
  });

  describe('getEnabledModules', () => {
    it('returns all modules when all enabled', async () => {
      const { getEnabledModules } = await import('./config.js');
      const modules = getEnabledModules();
      expect(modules).toContain('drive');
      expect(modules).toContain('sheets');
      expect(modules).toContain('slides');
      expect(modules).toContain('docs');
      expect(modules).toContain('revisions');
    });

    it('excludes disabled modules', async () => {
      process.env.ENABLE_SHEETS = 'false';
      process.env.ENABLE_DOCS = 'false';
      const { getEnabledModules } = await import('./config.js');
      const modules = getEnabledModules();
      expect(modules).toContain('drive');
      expect(modules).toContain('slides');
      expect(modules).toContain('revisions');
      expect(modules).not.toContain('sheets');
      expect(modules).not.toContain('docs');
    });
  });
});
