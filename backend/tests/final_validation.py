import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

# Mocking some dependencies if needed, but better to try direct import
try:
    from app.services.model_service import spam_model as model_service
    
    def test_samples():
        samples = [
            {
                "name": "Bank Statement (The 'Legit' Test)",
                "text": "Hi Admin, your bank statement for February 2026 is now available. Please login to your secure portal to view details. This is an automated notification from MailSentra Bank."
            },
            {
                "name": "Urgent Security Phishing",
                "text": "URGENT: Your account has been locked due to suspicious activity. Click here to verify your identity immediately: http://mailsentra-securityverify.net/login?id=123"
            },
            {
                "name": "Workplace Collaboration (Ham)",
                "text": "Hey team, looking forward to the architecture review tomorrow at 10 AM. I've attached the latest diagrams for the new ledger engine discussion. See you then."
            },
            {
                "name": "Generic Prize Spam",
                "text": "Congratulations! You've been selected as the winner of a $1000 Amazon Gift Card. Claim your reward now at http://win-prizes-fast.tk/claim"
            },
            {
                "name": "Newsletter (Unseen Ham)",
                "text": "Your weekly digest of tech news is here. This week we cover the rise of agentic AI and its impact on the coding industry. Read the full article on our website."
            },
            {
                "name": "Personal Note (Unseen Ham)",
                "text": "Hi Mom, just wanted to check in and see how you're doing. Let's catch up this weekend for lunch. Love you!"
            },
            {
                "name": "Tech Support Scam (Unseen Spam)",
                "text": "Your Windows PC has been infected with a virus. Call our certified technicians immediately at 1-800-555-0199 for removal. Your data is at risk!"
            }
        ]
        
        print("=" * 60)
        print("   MAILSENTRA SPAM MODEL V2.1 - FINAL PRODUCTION TEST")
        print("=" * 60)
        
        # Point to the correct model path relative to root
        model_service.model_path = "backend/ml_models/spam_model.pkl"
        model_service.load_model()
        
        for i, s in enumerate(samples, 1):
            prediction = model_service.predict(s['text'])
            res = prediction['result'].upper()
            conf = prediction['confidence'] * 100
            
            print(f"\n{i}. TEST: {s['name']}")
            print(f"   Message: \"{s['text'][:80]}...\"")
            print(f"   RESULT: {res} ({conf:.2f}% Confidence)")
            
            # Simple validation check
            if "Phishing" in s['name'] or "Spam" in s['name']:
                if res == "SPAM":
                    print("   ✅ PASSED")
                else:
                    print("   ❌ FAILED: Should be SPAM")
            else:
                # Samples without 'Phishing' or 'Spam' in name are expected to be HAM
                if res == "HAM":
                    print("   ✅ PASSED")
                else:
                    print(f"   ❌ FAILED: Should be HAM")
        
        print("\n" + "=" * 60)

    if __name__ == "__main__":
        test_samples()

except Exception as e:
    print(f"Error initializing test: {e}")
    import traceback
    traceback.print_exc()
