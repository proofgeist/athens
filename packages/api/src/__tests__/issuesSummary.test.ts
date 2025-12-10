import { describe, it, expect } from 'vitest';
import { IssuesSummaryLayout } from '@athens/fm-client';

describe('IssuesSummary Data API', () => {
  describe('find', () => {
    it('should list all issues summaries', async () => {
      const result = await IssuesSummaryLayout.find({
        query: [{ id: '*' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      console.log(`Found ${result.data?.length || 0} issues summaries`);
    });

    it('should filter by project_asset_id', async () => {
      const result = await IssuesSummaryLayout.find({
        query: [{ project_asset_id: '1' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const summary of result.data) {
          expect(summary.fieldData.project_asset_id).toBe('1');
        }
        console.log(`Found ${result.data.length} summaries for project asset 1`);
      }
    });

    it('should have priority counts', async () => {
      const result = await IssuesSummaryLayout.find({
        query: [{ id: '*' }],
        limit: 1,
      });

      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const summary = result.data[0];
        expect(summary.fieldData.open_high).toBeDefined();
        expect(summary.fieldData.closed_high).toBeDefined();
        expect(summary.fieldData.open_medium).toBeDefined();
        expect(summary.fieldData.closed_medium).toBeDefined();
        expect(summary.fieldData.open_low).toBeDefined();
        expect(summary.fieldData.closed_low).toBeDefined();
        console.log(`Summary: High(${summary.fieldData.open_high}/${summary.fieldData.closed_high}), Medium(${summary.fieldData.open_medium}/${summary.fieldData.closed_medium}), Low(${summary.fieldData.open_low}/${summary.fieldData.closed_low})`);
      }
    });

    it('should have system progress data', async () => {
      const result = await IssuesSummaryLayout.find({
        query: [{ id: '*' }],
        limit: 10,
      });

      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const summary of result.data) {
          expect(summary.fieldData.system_group).toBeDefined();
          expect(summary.fieldData.system_progress).toBeDefined();
        }
        console.log(`System groups found: ${[...new Set(result.data.map(s => s.fieldData.system_group))].join(', ')}`);
      }
    });
  });
});
