# Model Training & Retraining Guide

## 📚 Overview

This guide explains how to train and retrain the spam detection model using different datasets. The system supports multiple training methods:

1. **Initial Training**: Train from scratch using the default or uploaded dataset
2. **Retraining**: Improve model using user feedback data
3. **Custom Dataset Training**: Upload your own CSV dataset and train

---

## 🎯 Quick Start

### Option 1: Train with Default Dataset (Easiest)

1. Go to **Admin Dashboard** → **Model** tab
2. Click **"Train Model"** button
3. Wait 1-5 minutes for training to complete
4. Model will be automatically saved and loaded

### Option 2: Upload Your Own Dataset

1. Go to **Admin Dashboard** → **Model** tab
2. Click **"Upload Dataset"** button
3. Select a CSV file (format requirements below)
4. Wait for upload validation
5. Click **"Train with Uploaded Dataset"**

### Option 3: Retrain with User Feedback

1. Collect at least 10 user feedback entries (misclassified samples)
2. Go to **Admin Dashboard** → **Model** tab
3. Check retrain status (should show "Ready to retrain")
4. Click **"Retrain Model"** button
5. Model combines feedback with original dataset automatically

---

## 📋 Dataset Format Requirements

### CSV File Structure

Your CSV file must have these columns:

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| `label` | ✅ Yes | Must be `spam` or `ham` | `spam`, `ham` |
| `message` or `text` | ✅ Yes | The email/message text | `"Free money click here!"` |

### Accepted Formats

1. **Standard CSV** (recommended):
```csv
label,message
spam,Free money click here now!!!
ham,Hey how are you doing?
spam,URGENT! Your account needs verification
ham,Thanks for the help yesterday
```

2. **Tab-separated** (for compatibility):
```csv
label	message
spam	Free money click here now!!!
ham	Hey how are you doing?
```

### Label Guidelines

- ✅ **Valid labels**: `spam`, `ham` (case-insensitive)
- ❌ **Invalid**: `spammy`, `legitimate`, `good`, `bad`
- Labels are automatically normalized: `"not spam"` → `"ham"`, `"SPAM"` → `"spam"`

---

## 🔧 Training Methods Explained

### 1. Initial Training (From Scratch)

**What it does:**
- Trains a completely new model from a dataset
- Creates a fresh model with new version number
- Used when no model exists or starting fresh

**When to use:**
- First time setup
- Want to start completely fresh
- Have a new large dataset to train on

**Dataset used:**
- Default: SMS Spam Collection (5,574 samples)
- Or: Your uploaded CSV dataset

**Process:**
1. Load dataset
2. Preprocess text (clean, normalize, tokenize)
3. Split into train/test (80/20)
4. Train Naive Bayes classifier
5. Evaluate accuracy
6. Save model with new version

### 2. Retraining (With Feedback)

**What it does:**
- Improves existing model using user corrections
- Combines feedback with original dataset (prevents forgetting)
- Creates new model version incrementally

**When to use:**
- Have 10+ user feedback entries
- Want to improve accuracy on specific patterns
- Model misclassifies certain messages

**Data used:**
- User feedback (misclassified samples)
- Original dataset (to prevent catastrophic forgetting)

**Process:**
1. Collect misclassified feedback samples
2. Combine with original dataset
3. Retrain on combined data
4. Save as new version

### 3. Custom Dataset Training

**What it does:**
- Train from your own CSV file
- Useful for domain-specific spam detection
- Full control over training data

**When to use:**
- Have industry-specific spam examples
- Want to use proprietary datasets
- Need to test different data sources

---

## 🚀 Step-by-Step: Upload & Train

### Via Admin UI (Recommended)

1. **Prepare your CSV file**
   - Format: `label,message` columns
   - Labels: `spam` or `ham` only
   - Save as `.csv` file

2. **Upload dataset**
   - Navigate to Admin → Model tab
   - Click "Upload Dataset"
   - Select your CSV file
   - Wait for validation (shows stats)

3. **Train model**
   - Once uploaded, click "Train with Uploaded Dataset"
   - Wait 1-5 minutes
   - See accuracy results

### Via API (For Developers)

```python
import requests

# 1. Upload dataset
files = {'file': open('my_dataset.csv', 'rb')}
headers = {'Authorization': 'Bearer YOUR_ADMIN_TOKEN'}
response = requests.post(
    'http://localhost:8000/api/retrain/upload-dataset',
    files=files,
    headers=headers
)
dataset_info = response.json()
print(f"Uploaded: {dataset_info['total_samples']} samples")

# 2. Train with uploaded dataset
train_response = requests.post(
    'http://localhost:8000/api/retrain/train',
    json={'dataset_path': dataset_info['file_path']},
    headers=headers
)
print(f"Accuracy: {train_response.json()['training_stats']['accuracy']}")
```

---

## 📊 Understanding Training Output

### Model Metadata

After training, the model saves:
- **Version**: Incremental version number (e.g., `v1.0`, `v1.1`)
- **Accuracy**: Test set accuracy (0.0 to 1.0)
- **Algorithm**: `Multinomial Naive Bayes`
- **Trained At**: Timestamp
- **Training Samples**: Number of samples used

### Accuracy Interpretation

- **95%+**: Excellent model
- **90-95%**: Good model
- **85-90%**: Acceptable model
- **<85%**: May need more training data

### Classification Report

The training shows:
- **Precision**: How many predicted spam are actually spam
- **Recall**: How many actual spam were caught
- **F1-Score**: Balance between precision and recall
- **Support**: Number of samples in each class

---

## 🔄 Retraining Best Practices

### When to Retrain

✅ **Good reasons:**
- Have collected 10+ feedback samples
- Model consistently misses certain patterns
- New spam types emerging
- User reports many false positives/negatives

❌ **Don't retrain:**
- Only 1-2 feedback samples
- Model accuracy is already high (>95%)
- Recent retraining (< 24 hours ago)

### Feedback Collection

1. **Encourage users to provide feedback**
   - Easy buttons in logs table
   - Clear instructions
   - Show impact ("Help improve the model")

2. **Quality over quantity**
   - 10 good feedback samples > 50 bad ones
   - Ensure labels are correct
   - Diverse examples (different spam types)

3. **Monitor feedback stats**
   - Check Admin → Feedback tab
   - See misclassified count
   - Verify feedback quality

---

## 🛠️ Advanced: Manual Training

### Via Command Line

```bash
# Navigate to backend directory
cd backend

# Train with default dataset
python train_model.py

# Train with custom dataset
python -c "
from train_model import main
main('dataset/my_custom_dataset.csv')
"
```

### Training Parameters

You can modify `train_model.py` to adjust:
- **Test size**: Default `0.2` (20% for testing)
- **Max features**: Default `3000` (vocabulary size)
- **Algorithm**: Currently `MultinomialNB`

---

## 📁 Dataset Location & Management

### Default Datasets

- **Location**: `backend/dataset/`
- **Default file**: `SMSSpamCollection` (tab-separated)
- **Sample file**: `sample_spam.csv` (for testing)

### Uploaded Datasets

- **Location**: `backend/dataset/uploaded_TIMESTAMP_filename.csv`
- **Naming**: `uploaded_YYYYMMDD_HHMMSS_originalname.csv`
- **Storage**: All uploaded datasets are kept

### Model Files

- **Location**: `backend/ml_models/`
- **Latest**: `spam_model.pkl` (always points to latest)
- **Versioned**: `spam_model_v1.0.pkl`, `spam_model_v1.1.pkl`, etc.

---

## ⚠️ Troubleshooting

### "Dataset file not found"

**Problem**: Uploaded dataset path is incorrect

**Solution**:
- Check file was uploaded successfully
- Verify path in upload response
- Use full path from upload response

### "Invalid CSV format"

**Problem**: CSV doesn't match expected format

**Solution**:
- Ensure `label` column exists
- Ensure `message` or `text` column exists
- Check for empty rows
- Verify CSV encoding (UTF-8)

### "Invalid labels found"

**Problem**: Labels are not `spam` or `ham`

**Solution**:
- Normalize labels: `"spam"`, `"ham"` (lowercase)
- Replace `"not spam"` with `"ham"`
- Remove any custom labels

### "Training failed: Insufficient data"

**Problem**: Not enough samples or class imbalance

**Solution**:
- Need at least 50 samples per class
- Balance spam/ham ratio (aim for 20-80% spam)
- Check minimum class has at least 2 samples

### Low Accuracy After Training

**Possible causes:**
- Small dataset (< 100 samples)
- Poor quality labels
- Severe class imbalance
- Dataset not representative

**Solutions:**
- Add more training data
- Verify label accuracy
- Balance classes
- Use domain-specific data

---

## 📈 Model Versioning

### How Versions Work

- **Initial**: `v1.0`
- **Retrain 1**: `v1.1`
- **Retrain 2**: `v1.2`
- **Custom dataset**: `v2.0` (major version)

### Version Management

- Each training creates new version
- Previous versions are kept
- Latest version is loaded automatically
- Can rollback by renaming files (advanced)

---

## 🎓 ML Concepts (For Reference)

### What Happens During Training?

1. **Preprocessing**: Clean and normalize text
2. **Feature Extraction**: Convert text to numbers (CountVectorizer)
3. **Model Training**: Learn patterns (Naive Bayes)
4. **Evaluation**: Test on unseen data
5. **Saving**: Store model for predictions

### Catastrophic Forgetting Prevention

When retraining, the system:
- Loads original dataset (5,574 samples)
- Combines with feedback samples
- Trains on combined data
- This prevents model from "forgetting" original patterns

### Why Naive Bayes?

- Fast training and prediction
- Works well with text data
- Handles high-dimensional features
- Interpretable results

---

## 💡 Tips & Best Practices

1. **Start with default dataset** for baseline
2. **Collect feedback** from real users
3. **Retrain regularly** when feedback accumulates
4. **Monitor accuracy** after each retrain
5. **Keep datasets organized** in `dataset/` folder
6. **Document custom datasets** with notes
7. **Test on diverse examples** before deploying
8. **Backup models** before major changes

---

## 📞 Support

If you encounter issues:
1. Check logs in backend console
2. Verify dataset format matches requirements
3. Ensure sufficient training data
4. Check file permissions in `dataset/` folder
5. Review error messages for specific issues

---

**Last Updated**: 2024
**Model Version**: v3.1+
**Dataset Format**: CSV with `label` and `message`/`text` columns

