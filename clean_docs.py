import re

def remove_emojis(text):
    # Regex to match emojis
    return re.sub(r'[^\x00-\x7F]+', '', text)

files = [
    r"c:\Users\User\Desktop\mailsentra\README.md",
    r"c:\Users\User\Desktop\mailsentra\SYSTEM_DOCUMENTATION.md",
    r"c:\Users\User\Desktop\mailsentra\THE_MAILSENTRA_SYSTEM.md"
]

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Specific fix for "L❤️" which might be weirdly encoded
        content = content.replace("Made with L❤️", "Made")
        
        cleaned_content = remove_emojis(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        print(f"Cleaned {file_path}")
    except Exception as e:
        print(f"Error cleaning {file_path}: {e}")
