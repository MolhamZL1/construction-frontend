تم تطبيق تصحيح تحديث الإنجاز حسب Postman:
POST /projects/:projectId/work-items/:workItemId/progress/:spaceId
form-data:
- completed = 1 / 0
- photos[] = image files

الملفات المتأثرة غالباً:
- src/features/work-items/api/work-items.api.ts
- src/features/work-items/components/WorkItemProgressSection.tsx
