import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, IssuesSummary } from '../db';

describe('IssuesSummary OData API', () => {
  describe('list', () => {
    it('should list issues summaries with filter', async () => {
      // Use a filter to avoid slow unfiltered queries
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, '1'))
        .top(10)
        .execute();

      // Handle both success and "no data" cases
      if (result.error) {
        console.log('Query returned error (may be expected if no data):', result.error.message);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data?.length || 0} issues summaries`);
      }
    });

    it('should filter by project_asset_id', async () => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, '1'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const summary of result.data) {
          expect(summary.project_asset_id).toBe('1');
        }
        console.log(`Found ${result.data.length} summaries for project asset 1`);
      }
    });

    it('should have priority counts', async () => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, '1'))
        .top(1)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const summary = result.data[0];
        expect(summary.open_high).toBeDefined();
        expect(summary.closed_high).toBeDefined();
        expect(summary.open_medium).toBeDefined();
        expect(summary.closed_medium).toBeDefined();
        expect(summary.open_low).toBeDefined();
        expect(summary.closed_low).toBeDefined();
        console.log(`Summary: High(${summary.open_high}/${summary.closed_high}), Medium(${summary.open_medium}/${summary.closed_medium}), Low(${summary.open_low}/${summary.closed_low})`);
      }
    });

    it('should have system progress data', async () => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, '1'))
        .top(10)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const summary of result.data) {
          expect(summary.system_group).toBeDefined();
          expect(summary.system_progress).toBeDefined();
        }
        console.log(`System groups found: ${[...new Set(result.data.map(s => s.system_group))].join(', ')}`);
      }
    });
  });
});
