# Dataset Format Guide

## Quick Reference

Your CSV file must have these columns:

```csv
label,message
spam,Free money click here now!!!
ham,Hey how are you doing?
spam,URGENT! Your account needs verification
ham,Thanks for the help yesterday
```

## Required Columns

- **`label`**: Must be `spam` or `ham` (case-insensitive)
- **`message`** or **`text`**: The email/message text

## Valid Labels

- ✅ `spam`
- ✅ `ham`
- ✅ `SPAM` (auto-converted to lowercase)
- ✅ `not spam` (auto-converted to `ham`)
- ❌ Any other labels will be rejected

## Example CSV Files

### Format 1: Standard CSV
```csv
label,message
spam,Free money click here now!!!
ham,Hey how are you doing?
```

### Format 2: With 'text' column
```csv
label,text
spam,Free money click here now!!!
ham,Hey how are you doing?
```

### Format 3: Tab-separated (compatible)
```csv
label	message
spam	Free money click here now!!!
ham	Hey how are you doing?
```

## File Requirements

- **File Type**: `.csv` only
- **Encoding**: UTF-8 (recommended)
- **Minimum Samples**: 50 per class (100 total recommended)
- **Balance**: Aim for 20-80% spam ratio for best results

## Upload Process

1. Click "Upload Dataset" in Admin → Model tab
2. Select your CSV file
3. System validates format automatically
4. See stats (total, spam, ham counts)
5. Click "Train with Uploaded Dataset" to train

## Troubleshooting

**"CSV must have 'label' column"**
- Add a `label` column with spam/ham values

**"Invalid labels found"**
- Ensure all labels are exactly `spam` or `ham`
- Check for typos: `spamm`, `spam ` (with space), etc.

**"CSV file is empty"**
- Ensure file has data rows (not just headers)

For full guide, see `docs/TRAINING_GUIDE.md`

