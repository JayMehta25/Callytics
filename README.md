# CallTytics Backend

Backend server for CallTytics AI application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
EMAIL_PASS=your_gmail_app_password
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Environment Variables

- `EMAIL_PASS`: Gmail app password for sending OTP emails
- `PORT`: Server port (default: 5005)

## MongoDB Atlas Connection

The application uses two separate MongoDB Atlas clusters for data storage:

1. **Employee Database**: Stores all employee information
2. **Manager Database**: Stores all manager information

To set up your connections:

1. Log in to your MongoDB Atlas account
2. Create two separate clusters if you don't have them
3. In the Security section, create a database user with read/write permissions
4. In the Network Access section, add your IP address to the whitelist
5. Click on "Connect" and select "Connect your application"
6. Copy the connection strings and replace the placeholders in your `.env` file

Example connection strings:
```
# For employees
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_db?retryWrites=true&w=majority

# For managers
MANAGER_MONGODB_URI=mongodb+srv://username:password@cluster1.xxxxx.mongodb.net/manager_db?retryWrites=true&w=majority
```

Replace `username`, `password`, and the cluster details with your actual MongoDB Atlas credentials.

## API Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Register a new employee
- `GET /api/employees/search?q=query` - Search employees by name or phone
- `GET /api/auth/check-manager` - Check if a manager account exists
- `POST /api/auth/setup-manager` - Set up a new manager account
- `POST /api/auth/login` - Login for both managers and employees

## Deployment

When deploying to a hosting service:

1. Set the environment variables in your hosting platform's configuration
2. Make sure to set both `MONGODB_URI` and `MANAGER_MONGODB_URI` to your MongoDB Atlas connection strings
3. Set the `PORT` if your hosting platform requires a specific port

## Troubleshooting

If you encounter connection issues:

1. Check that your MongoDB Atlas clusters are running
2. Verify that your IP address is whitelisted in MongoDB Atlas
3. Ensure your database user has the correct permissions
4. Check that your connection strings are correctly formatted in the `.env` file
5. Use the `/api/health` endpoint to check the status of both database connections 