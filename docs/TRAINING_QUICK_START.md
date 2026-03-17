# Training & Retraining Quick Start Guide

## For Admins: How to Train/Retrain Models

### Option 1: Upload Your Own Dataset (Easiest!)

1. **Prepare your CSV file**:
   - Must have columns: `label`, `message`
   - Labels: `spam` or `ham` only
   - Save as `.csv` file

2. **Upload via Admin UI**:
   - Go to **Admin Dashboard** → **Model** tab
   - Click **"Choose CSV File"** in Upload section
   - Select your CSV file
   - Wait for validation (shows stats)

3. **Train model**:
   - After upload, click **"Train with Uploaded Dataset"**
   - Wait 1-5 minutes
   - See accuracy results!

### Option 2: Use Default Dataset

- Go to **Admin Dashboard** → **Model** tab
- Click **"Train with Default Dataset"**
- Uses SMS Spam Collection (5,574 samples)

### Option 3: Retrain with User Feedback

1. Collect 10+ user feedback entries
2. Go to **Admin Dashboard** → **Model** tab
3. Check status (should show "✓ Ready")
4. Click **"Retrain Model"**
5. Model improves using feedback automatically

---

## CSV Format Example

```csv
label,message
spam,Free money click here now!!!
ham,Hey how are you doing?
spam,URGENT! Your account needs verification
ham,Thanks for the help yesterday
```

**Important**:
- First row must be headers: `label,message`
- Labels must be exactly `spam` or `ham`
- No other columns needed

---

## Key Concepts

### Initial Training
- Trains from scratch with a dataset
- Creates brand new model
- Use when no model exists

### Retraining  
- Improves existing model
- Uses user feedback (misclassified samples)
- Combines with original data (prevents forgetting)
- Need 10+ feedback samples minimum

### Custom Dataset
- Your own CSV file
- Domain-specific spam examples
- Better for industry-specific use cases

---

## For ML Developers

### Training Pipeline

1. **Load Dataset** → CSV file with label,message
2. **Preprocess** → Clean, normalize, tokenize text
3. **Feature Extraction** → Convert text to numbers (CountVectorizer)
4. **Train Model** → Naive Bayes classifier
5. **Evaluate** → Test accuracy on held-out data
6. **Save Model** → Store with version number

### Retraining Pipeline

1. **Collect Feedback** → User corrections (misclassified)
2. **Combine Data** → Feedback + original dataset
3. **Retrain** → Same pipeline as initial training
4. **Save New Version** → Increment version (v1.0 → v1.1)

---

## Expected Results

- **Accuracy**: Typically 85-98% depending on data quality
- **Training Time**: 1-5 minutes for 1000-10000 samples
- **Model Size**: ~1-5 MB (depends on vocabulary size)

---

## Best Practices

1. **Start with default dataset** for baseline
2. **Upload larger datasets** for better accuracy (5000+ samples)
3. **Balance classes** - aim for 20-80% spam ratio
4. **Retrain regularly** when feedback accumulates (every 50+ samples)
5. **Monitor accuracy** after each retrain

---

## Common Issues

**"Invalid CSV format"**
- Check you have `label` and `message` columns
- Ensure first row is headers

**"Invalid labels found"**  
- Labels must be exactly `spam` or `ham`
- No spaces, no typos

**"Training failed: Insufficient data"**
- Need at least 50 samples per class
- Check class balance

For detailed guide, see `docs/TRAINING_GUIDE.md`

