"""
Seed default training content into database
Run this script after creating the training tables
"""
from app.database import SessionLocal
from app.models.training import TrainingSection, TrainingExample, TrainingQuiz, TrainingTip

def seed_training_content():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing = db.query(TrainingSection).first()
        if existing:
            print("Training content already exists. Skipping seed.")
            return
        
        # ==================== SECTION 1: Spam vs Ham ====================
        section1 = TrainingSection(
            title="Spam vs Ham Identification",
            icon="mail",
            order=1,
            content="""
<h2 class="text-2xl font-bold text-white mb-4">What is Spam vs Ham?</h2>
<p class="text-slate-300 mb-4">Understanding the difference between spam (unwanted emails) and ham (legitimate emails) is crucial for email security.</p>

<h3 class="text-xl font-semibold text-cyan-400 mb-3 mt-6">Common Spam Indicators:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
  <li>Urgent language demanding immediate action</li>
  <li>Requests for personal or financial information</li>
  <li>Poor grammar and spelling errors</li>
  <li>Generic greetings (e.g., "Dear Customer")</li>
  <li>Suspicious sender addresses</li>
  <li>Offers that seem too good to be true</li>
</ul>

<h3 class="text-xl font-semibold text-green-400 mb-3">Legitimate Email Characteristics:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2">
  <li>Personalized greetings with your name</li>
  <li>Professional formatting and branding</li>
  <li>Legitimate sender domain</li>
  <li>Expected communication based on your activities</li>
  <li>No pressure for immediate action</li>
</ul>
            """,
            is_active=True
        )
        db.add(section1)
        db.flush()
        
        # Examples for Section 1
        examples1 = [
            TrainingExample(
                section_id=section1.id,
                type="spam",
                subject="URGENT: Your account will be closed!",
                content="Dear Customer, Your account has been compromised. Click here immediately to verify your identity or your account will be permanently closed within 24 hours!",
                analysis="This is spam because it uses urgent language, generic greeting, and creates false urgency.",
                order=1
            ),
            TrainingExample(
                section_id=section1.id,
                type="ham",
                subject="Your monthly statement is ready",
                content="Hi John, Your bank statement for January 2024 is now available. Log in to your account to view it.",
                analysis="This is legitimate - personalized greeting, expected communication, no pressure tactics.",
                order=2
            )
        ]
        for ex in examples1:
            db.add(ex)
        
        # Quiz for Section 1
        quiz1 = [
            TrainingQuiz(
                section_id=section1.id,
                question="Congratulations! You won $1,000,000! Click here to claim your prize now!",
                correct_answer="spam",
                explanation="This is spam - unrealistic prize, urgent call to action, likely phishing attempt.",
                order=1
            ),
            TrainingQuiz(
                section_id=section1.id,
                question="Hi Sarah, Your package from Amazon will be delivered tomorrow between 2-4 PM.",
                correct_answer="ham",
                explanation="This appears legitimate - personalized, specific delivery information, expected notification.",
                order=2
            )
        ]
        for q in quiz1:
            db.add(q)
        
        # ==================== SECTION 2: Phishing & Cyber Threats ====================
        section2 = TrainingSection(
            title="Phishing & Cyber Threats",
            icon="shield",
            order=2,
            content="""
<h2 class="text-2xl font-bold text-white mb-4">Understanding Phishing Attacks</h2>
<p class="text-slate-300 mb-4">Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information.</p>

<h3 class="text-xl font-semibold text-red-400 mb-3 mt-6">Types of Phishing:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
  <li><strong>Email Phishing:</strong> Mass emails pretending to be from trusted sources</li>
  <li><strong>Spear Phishing:</strong> Targeted attacks on specific individuals</li>
  <li><strong>Whaling:</strong> Attacks targeting high-profile executives</li>
  <li><strong>Smishing:</strong> Phishing via SMS text messages</li>
</ul>

<h3 class="text-xl font-semibold text-yellow-400 mb-3">Red Flags to Watch For:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2">
  <li>Suspicious links (hover to check actual URL)</li>
  <li>Unexpected attachments</li>
  <li>Requests for passwords or sensitive data</li>
  <li>Mismatched sender email addresses</li>
  <li>Threatening or urgent language</li>
</ul>
            """,
            is_active=True
        )
        db.add(section2)
        db.flush()
        
        # Tips for Section 2
        tips2 = [
            TrainingTip(
                section_id=section2.id,
                title="Verify Links",
                description="Hover over links before clicking. The actual URL should match the claimed destination.",
                icon="link",
                order=1
            ),
            TrainingTip(
                section_id=section2.id,
                title="Check Attachments",
                description="Never open unexpected attachments, especially .exe, .zip, or .js files.",
                icon="paperclip",
                order=2
            ),
            TrainingTip(
                section_id=section2.id,
                title="Verify Sender",
                description="Look closely at the sender's email address. Phishers often use similar-looking domains.",
                icon="mail",
                order=3
            )
        ]
        for tip in tips2:
            db.add(tip)
        
        # ==================== SECTION 3: Best Practices ====================
        section3 = TrainingSection(
            title="Email Security Best Practices",
            icon="award",
            order=3,
            content="""
<h2 class="text-2xl font-bold text-white mb-4">Protect Yourself with Best Practices</h2>

<h3 class="text-xl font-semibold text-cyan-400 mb-3">Do's:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
  <li>Use MailSentra to scan suspicious emails before interacting</li>
  <li>Enable two-factor authentication on all accounts</li>
  <li>Keep software and systems updated</li>
  <li>Verify sender identity through secondary channels</li>
  <li>Report suspicious emails to IT/Security team</li>
  <li>Use strong, unique passwords for each account</li>
</ul>

<h3 class="text-xl font-semibold text-red-400 mb-3">Don'ts:</h3>
<ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
  <li>Never click on suspicious links or download unknown attachments</li>
  <li>Don't share passwords or sensitive information via email</li>
  <li>Don't trust emails based solely on appearance</li>
  <li>Don't ignore security warnings from your email client</li>
  <li>Don't use public Wi-Fi for sensitive communications</li>
</ul>

<h3 class="text-xl font-semibold text-green-400 mb-3">How to Report Suspicious Emails:</h3>
<ol class="list-decimal list-inside text-slate-300 space-y-2">
  <li>Do not click any links or download attachments</li>
  <li>Use MailSentra to analyze the email</li>
  <li>If flagged as spam, provide feedback to improve the model</li>
  <li>Forward the email to your IT security team</li>
  <li>Delete the email from your inbox</li>
</ol>
            """,
            is_active=True
        )
        db.add(section3)
        
        db.commit()
        print(" Training content seeded successfully!")
        print("Created 3 training sections with examples, quiz questions, and tips.")
        
    except Exception as e:
        print(f"Error seeding training content: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print(" Seeding training content...")
    seed_training_content()