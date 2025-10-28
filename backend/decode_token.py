import jwt
import sys

if len(sys.argv) < 2:
    print("Usage: python decode_token.py YOUR_TOKEN_HERE")
    sys.exit(1)

token = sys.argv[1]
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

try:
    decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    print("\nToken contents:")
    for key, value in decoded.items():
        print(f"  {key}: {value}")
except Exception as e:
    print(f"Error decoding token: {e}")
