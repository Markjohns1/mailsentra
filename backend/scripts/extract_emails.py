import os
import tarfile
import pandas as pd
import email
from email import policy
import shutil
from pathlib import Path

def parse_email_strictly(content):
    """Uses the robust email library to strip all headers except Subject and extract body."""
    try:
        msg = email.message_from_string(content, policy=policy.default)
        subject = str(msg.get('Subject', ''))
        
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    try:
                        payload = part.get_payload(decode=True)
                        if isinstance(payload, bytes):
                            body += payload.decode('latin-1', errors='ignore')
                        elif isinstance(payload, str):
                            body += payload
                    except:
                        pass
        else:
            payload = msg.get_payload(decode=True)
            if isinstance(payload, bytes):
                body = payload.decode('latin-1', errors='ignore')
            elif isinstance(payload, str):
                body = payload
        
        # Return only the essential parts
        cleaned = f"Subject: {subject}\n\n{body}"
        return cleaned.strip()
    except Exception as e:
        return content # Fallback to raw if logic fails

def process_corpus():
    # Detect script location to fix pathing issues
    script_root = Path(__file__).parent.absolute()
    base_dir = script_root / "backend" / "dataset"
    raw_dir = base_dir / "raw"
    temp_extract_dir = base_dir / "temp_extract"
    
    # Check both root and raw_dir
    raw_files = list(raw_dir.glob("*.tar.bz2")) + list(script_root.glob("*.tar.bz2"))
    
    if not raw_files:
        print(f"No .tar.bz2 archives found.")
        print(f"Looked in: {raw_dir} and {script_root}")
        return

    all_data = []
    
    if temp_extract_dir.exists():
        shutil.rmtree(temp_extract_dir)

    print("--- STARTING CLEAN EXTRACTION (Stripping Headers) ---")
    for f in raw_files:
        filename = f.name.lower()
        if "spam" in filename:
            label = "spam"
        elif "ham" in filename:
            label = "ham"
        else:
            continue
            
        current_extract_path = temp_extract_dir / f.stem
        os.makedirs(current_extract_path, exist_ok=True)
        
        print(f"Processing {label.upper()} archive: {f.name}")
        try:
            with tarfile.open(f, "r:bz2") as tar:
                tar.extractall(path=current_extract_path)
        except Exception as e:
            print(f"  Error extracting {f.name}: {e}")
            continue

        count = 0
        for root, _, files in os.walk(current_extract_path):
            for file_name in files:
                if file_name.startswith('.') or file_name == 'cmds':
                    continue
                
                email_file = Path(root) / file_name
                try:
                    with open(email_file, 'r', encoding='latin-1') as em:
                        content = em.read()
                        text = parse_email_strictly(content)
                        if len(text) > 20: 
                            all_data.append({'label': label, 'message': text})
                            count += 1
                except:
                    continue
        print(f"  - Successfully extracted {count} clean {label.upper()} emails")

    if not all_data:
        print("Final check failed: No valid data found.")
        return

    df = pd.DataFrame(all_data)
    original_size = len(df)
    df = df.drop_duplicates(subset=['message'])
    
    print(f"\nFinal Cleanup: Removed {original_size - len(df)} duplicates.")
    
    output_path = base_dir / "emails_dataset.csv"
    df.to_csv(output_path, index=False)
    
    print("-" * 40)
    print(f"CLEAN DATASET READY: {output_path}")
    print(f"Total Unique Samples: {len(df)}")
    print(f"Ham Count:  {len(df[df['label'] == 'ham'])}")
    print(f"Spam Count: {len(df[df['label'] == 'spam'])}")
    print("-" * 40)

if __name__ == "__main__":
    process_corpus()
