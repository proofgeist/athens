import { describe, it, expect } from 'vitest';
import { ProjectAssetsLayout } from '@athens/fm-client';

describe('ProjectAssets Data API', () => {
  describe('find', () => {
    it('should list all project assets', async () => {
      const result = await ProjectAssetsLayout.find({
        query: [{ id: '*' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      console.log(`Found ${result.data?.length || 0} project assets`);
    });

    it('should filter by project_id', async () => {
      const result = await ProjectAssetsLayout.find({
        query: [{ project_id: '1' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const pa of result.data) {
          expect(pa.fieldData.project_id).toBe('1');
        }
        console.log(`Found ${result.data.length} project assets for project 1`);
      }
    });

    it('should return completion metrics', async () => {
      const result = await ProjectAssetsLayout.find({
        query: [{ id: '*' }],
        limit: 10,
      });

      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const pa = result.data[0];
        expect(pa.fieldData.raptor_checklist_completion).toBeDefined();
        expect(pa.fieldData.sit_completion).toBeDefined();
        expect(pa.fieldData.doc_verification_completion).toBeDefined();
        console.log(`Completion metrics: RAPTOR=${pa.fieldData.raptor_checklist_completion}%, SIT=${pa.fieldData.sit_completion}%, Doc=${pa.fieldData.doc_verification_completion}%`);
      }
    });
  });
});
