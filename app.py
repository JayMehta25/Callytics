from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import time

app = Flask(__name__)
CORS(app)

# Database initialization
def init_db():
    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    # Create employees table
    c.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            department TEXT NOT NULL,
            gender TEXT NOT NULL
        )
    ''')
    
    # Create recordings table
    c.execute('''
        CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            audio_path TEXT,
            duration REAL,
            rating REAL,
            employee_emotion TEXT,
            customer_emotion TEXT,
            transcript TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        )
    ''')
    
    # Create managers table
    c.execute('''
        CREATE TABLE IF NOT EXISTS managers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Employee Management API"})

@app.route('/api/employees/login', methods=['POST'])
def login():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')

    if not name and not phone:
        return jsonify({'success': False, 'message': 'Name or phone number required'}), 400

    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    # Try to find employee by name or phone
    c.execute('SELECT * FROM employees WHERE name = ? OR phone = ?', (name, phone))
    employee = c.fetchone()
    conn.close()

    if employee:
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'employee': {
                'id': employee[0],
                'name': employee[1],
                'phone': employee[2],
                'department': employee[3],
                'gender': employee[4]
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Employee not found'}), 404

@app.route('/api/employees/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')
    department = data.get('department')
    gender = data.get('gender')

    if not name or not department or not gender:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    try:
        # Check if employee already exists
        c.execute('SELECT * FROM employees WHERE name = ? OR phone = ?', (name, phone))
        existing = c.fetchone()
        if existing:
            return jsonify({'success': False, 'message': 'Employee already exists'}), 400

        c.execute(
            'INSERT INTO employees (name, phone, department, gender) VALUES (?, ?, ?, ?)',
            (name, phone, department, gender)
        )
        conn.commit()
        
        # Get the newly created employee
        employee_id = c.lastrowid
        c.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
        employee = c.fetchone()
        
        return jsonify({
            'success': True,
            'message': 'Employee registered successfully',
            'employee': {
                'id': employee[0],
                'name': employee[1],
                'phone': employee[2],
                'department': employee[3],
                'gender': employee[4]
            }
        }), 201
    except sqlite3.Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/employees/search', methods=['POST'])
def search():
    data = request.json
    name = data.get('name')
    is_login = data.get('isLogin', False)

    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400

    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    # For login, do exact match. For search, do partial match
    if is_login:
        c.execute('SELECT * FROM employees WHERE name = ?', (name,))
    else:
        c.execute('SELECT * FROM employees WHERE name LIKE ?', (f'%{name}%',))
    
    employee = c.fetchone()
    conn.close()

    if employee:
        return jsonify({
            'success': True,
            'message': 'Employee found',
            'employee': {
                'id': employee[0],
                'name': employee[1],
                'phone': employee[2],
                'department': employee[3],
                'gender': employee[4]
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Employee not found'}), 404

@app.route('/api/employees/<int:employee_id>/recordings', methods=['GET'])
def get_employee_recordings(employee_id):
    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    # Check if employee exists
    c.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
    employee = c.fetchone()
    
    if not employee:
        conn.close()
        return jsonify({'success': False, 'message': 'Employee not found'}), 404
    
    # Get all recordings for the employee
    c.execute('''
        SELECT id, audio_path, duration, rating, employee_emotion, 
               customer_emotion, transcript, created_at 
        FROM recordings 
        WHERE employee_id = ?
        ORDER BY created_at DESC
    ''', (employee_id,))
    
    recordings = c.fetchall()
    conn.close()
    
    # Format recordings for response
    formatted_recordings = [{
        'id': r[0],
        'audioPath': r[1],
        'duration': r[2],
        'rating': r[3],
        'employeeEmotion': r[4],
        'customerEmotion': r[5],
        'transcript': r[6],
        'createdAt': r[7]
    } for r in recordings]
    
    return jsonify(formatted_recordings)

@app.route('/api/employees/<int:employee_id>/recordings', methods=['POST'])
def add_employee_recording(employee_id):
    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    # Check if employee exists
    c.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
    employee = c.fetchone()
    
    if not employee:
        conn.close()
        return jsonify({'success': False, 'message': 'Employee not found'}), 404
    
    try:
        # Get form data
        audio_file = request.files.get('audio')
        duration = request.form.get('duration')
        rating = request.form.get('rating')
        employee_emotion = request.form.get('employeeEmotion')
        customer_emotion = request.form.get('customerEmotion')
        transcript = request.form.get('transcript')
        
        if not audio_file:
            return jsonify({'success': False, 'message': 'No audio file provided'}), 400
        
        # Save audio file
        filename = f"recording_{employee_id}_{int(time.time())}.wav"
        audio_path = os.path.join('recordings', filename)
        os.makedirs('recordings', exist_ok=True)
        audio_file.save(audio_path)
        
        # Save recording to database
        c.execute('''
            INSERT INTO recordings 
            (employee_id, audio_path, duration, rating, employee_emotion, 
             customer_emotion, transcript)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (employee_id, audio_path, duration, rating, employee_emotion, 
              customer_emotion, transcript))
        
        conn.commit()
        
        # Get the newly created recording
        recording_id = c.lastrowid
        c.execute('''
            SELECT id, audio_path, duration, rating, employee_emotion, 
                   customer_emotion, transcript, created_at 
            FROM recordings 
            WHERE id = ?
        ''', (recording_id,))
        
        recording = c.fetchone()
        conn.close()
        
        return jsonify({
            'id': recording[0],
            'audioPath': recording[1],
            'duration': recording[2],
            'rating': recording[3],
            'employeeEmotion': recording[4],
            'customerEmotion': recording[5],
            'transcript': recording[6],
            'createdAt': recording[7]
        }), 201
        
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/managers/setup', methods=['POST'])
def setup_manager():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not all([name, email, username, password]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    try:
        # Check if manager already exists
        c.execute('SELECT * FROM managers WHERE email = ? OR username = ?', (email, username))
        existing = c.fetchone()
        if existing:
            return jsonify({'success': False, 'message': 'Manager already exists'}), 400

        # Hash password (in production, use proper password hashing)
        hashed_password = password  # In production, use bcrypt or similar

        c.execute(
            'INSERT INTO managers (name, email, username, password) VALUES (?, ?, ?, ?)',
            (name, email, username, hashed_password)
        )
        conn.commit()
        
        # Get the newly created manager
        manager_id = c.lastrowid
        c.execute('SELECT * FROM managers WHERE id = ?', (manager_id,))
        manager = c.fetchone()
        
        return jsonify({
            'success': True,
            'message': 'Manager registered successfully',
            'manager': {
                'id': manager[0],
                'name': manager[1],
                'email': manager[2],
                'username': manager[3]
            }
        }), 201
    except sqlite3.Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/managers/login', methods=['POST'])
def manager_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    try:
        # Find manager by username
        c.execute('SELECT * FROM managers WHERE username = ?', (username,))
        manager = c.fetchone()
        
        if not manager:
            return jsonify({'success': False, 'message': 'Manager not found'}), 404
            
        # Check password (in production, use proper password verification)
        if manager[4] != password:  # In production, use bcrypt or similar
            return jsonify({'success': False, 'message': 'Invalid password'}), 401

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'manager': {
                'id': manager[0],
                'name': manager[1],
                'email': manager[2],
                'username': manager[3]
            }
        })
    except sqlite3.Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/managers/check', methods=['GET'])
def check_manager():
    conn = sqlite3.connect('employees.db')
    c = conn.cursor()
    
    try:
        c.execute('SELECT COUNT(*) FROM managers')
        count = c.fetchone()[0]
        
        return jsonify({
            'success': True,
            'hasManager': count > 0
        })
    except sqlite3.Error as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 