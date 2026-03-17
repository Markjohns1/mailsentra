"""
Creates or updates an admin user.

Usage:
    python create_admin.py
"""

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash
from app.config import settings

def main():
    db = SessionLocal()
    try:
        # Try to get credentials from .env
        email = getattr(settings, "ADMIN_EMAIL", None)
        password = getattr(settings, "ADMIN_PASSWORD", None)

        # If not defined, ask interactively
        if not email:
            email = input("Enter admin email: ").strip()
        if not password:
            password = input("Enter admin password: ").strip()

        # Check if an admin with this email already exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"Updating password for existing admin: {user.email}")
            user.hashed_password = get_password_hash(password)
            user.is_admin = True
            user.is_active = True
            db.commit()
            print(f"Admin user updated successfully.")
            return

        # Create new admin user
        admin_user = User(
            username="admin",
            email=email,
            hashed_password=get_password_hash(password),
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created: {admin_user.email}")

    finally:
        db.close()

if __name__ == "__main__":
    main()
