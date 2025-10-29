"""
Create initial admin user
Run this ONCE after creating the database
"""

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def create_admin():
    """Create default admin user"""
    db = SessionLocal()
    
    try:
        existing_admin = db.query(User).filter(User.email == "admin@spamdetector.com").first()
        
        if existing_admin:
            print("Admin user already exists")
            print(f"Email: {existing_admin.email}")
            print(f"Username: {existing_admin.username}")
            return
        
        admin = User(
            email="admin@spamdetector.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_admin=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("Admin user created successfully")
        print(f"Email: admin@spamdetector.com")
        print(f"Username: admin")
        print(f"Password: admin123")
        print("IMPORTANT: Change this password after first login")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()