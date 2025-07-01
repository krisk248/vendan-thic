# Google Sheets Setup Guide

## Step 1: Create Google Sheets

### Flashcards Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Vedantic Flashcards"
3. In the first row, add these column headers exactly:
   ```
   sanskrit_term | english_term | meaning | category | difficulty | image_url
   ```
4. Import the sample data from `sample-data/flashcards-google-sheets.csv`

### Quiz Questions Sheet  
1. Create another spreadsheet named "Vedantic Quiz Questions"
2. In the first row, add these column headers exactly:
   ```
   question | option_a | option_b | option_c | option_d | correct_answer | explanation | category | difficulty
   ```
3. Import the sample data from `sample-data/quiz-google-sheets.csv`

## Step 2: Publish Sheets as CSV

### For Each Sheet:
1. Open the Google Sheet
2. Go to **File** > **Share** > **Publish to web**
3. In the dialog:
   - Choose the specific sheet tab (not "Entire Document")
   - Select **Comma-separated values (.csv)** format
   - Click **Publish**
4. Copy the generated URL

### Example URL Format:
```
https://docs.google.com/spreadsheets/d/1AbC123XyZ/export?format=csv&gid=0
```

## Step 3: Configure Application

1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and add your URLs:
   ```bash
   FLASHCARDS_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_FLASHCARDS_SHEET_ID/export?format=csv&gid=0
   QUIZ_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_QUIZ_SHEET_ID/export?format=csv&gid=0
   ```

3. Restart your server:
   ```bash
   npm start
   ```

## Step 4: Verify Integration

1. Check server logs for Google Sheets integration status
2. Test sync endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/sync -H "Content-Type: application/json" -d '{"type": "all"}'
   ```

## Data Management Workflow

### Adding New Content:
1. Edit your Google Sheets directly
2. Add new rows with proper data
3. Trigger sync via API or restart server
4. Data automatically updates in the application

### Content Categories:
- **Core Concepts**: Fundamental Vedantic principles
- **Ethics**: Moral and ethical teachings  
- **Practices**: Spiritual practices and disciplines

### Difficulty Levels:
- **Beginner**: Basic concepts for newcomers
- **Intermediate**: Moderate complexity concepts
- **Advanced**: Complex philosophical concepts

## Important Notes

- Keep your Google Sheets URLs private (don't commit .env file)
- The app falls back to local CSV files if Google Sheets are unavailable
- Changes in Google Sheets take effect after sync (manual or automatic)
- Ensure column headers match exactly as specified
- Use UTF-8 encoding for Sanskrit characters

## Troubleshooting

### Common Issues:
1. **"Failed to fetch from Google Sheets"**
   - Check if sheets are published correctly
   - Verify URLs in .env file
   - Check internet connectivity

2. **"Column not found" errors**
   - Ensure column headers match exactly
   - Check for extra spaces in header names

3. **Sanskrit characters not displaying**
   - Ensure Google Sheets uses UTF-8 encoding
   - Verify browser supports Unicode

### Debug Commands:
```bash
# Check sync logs
curl http://localhost:3000/api/sync/logs

# Test individual syncs
curl -X POST http://localhost:3000/api/sync -d '{"type": "flashcards"}'
curl -X POST http://localhost:3000/api/sync -d '{"type": "quiz"}'
```