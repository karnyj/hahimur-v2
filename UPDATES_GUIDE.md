# How to Add an Update

Updates appear on the site's "עדכונים" page. They are stored in:

```
src/pages/updates/updates.ts
```

## Steps

1. Open `src/pages/updates/updates.ts`
2. Add a new object to the **beginning** of the `UPDATES` array (newest first)
3. Increment the `id` by 1 from the current highest
4. Push to `master` — the site deploys automatically within ~30 seconds

## Format

```ts
{
  id: 2,                          // next number after the last entry
  date: '8 ביוני 2026',           // Hebrew date string
  subject: 'כותרת העדכון',        // subject line shown at the top
  paragraphs: [
    'פסקה ראשונה.',
    'פסקה שנייה.\nשורה חדשה באותה פסקה.',
  ],
  // optional — only if attaching a PDF:
  pdfFilename: 'filename.pdf',    // file must be placed in /public/
  pdfLabel: 'תווית הקובץ',
}
```

## Rules

- Only edit the `UPDATES` array in this file. Do not touch any other files.
- Each paragraph in `paragraphs` is rendered as a separate block. Use `\n` for line breaks within a paragraph.
- PDF files go in the `/public/` folder.
