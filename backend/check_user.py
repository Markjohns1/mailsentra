import sqlite3

conn = sqlite3.connect('spam_detector.db')
cursor = conn.cursor()

result = cursor.execute(
    'SELECT id, email, username, is_admin, is_active FROM users WHERE email = ?',
    ('hackcraft@gmail.com',)
).fetchone()

if result:
    print(f'ID: {result[0]}')
    print(f'Email: {result[1]}')
    print(f'Username: {result[2]}')
    print(f'is_admin: {result[3]}')
    print(f'is_active: {result[4]}')
else:
    print('User not found')

conn.close()
