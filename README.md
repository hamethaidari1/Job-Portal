# Job Portal

## 📋 Description
A comprehensive Job Portal web application connecting job seekers with employers. Built with Node.js, Express, and MySQL, offering a seamless experience for posting jobs, applying for positions, and managing profiles.

## 🚀 Features
- User registration and authentication (Job Seeker & Employer roles)
- Job listing and search with filters
- Application management
- Email notifications
- Admin dashboard
- Multi-language support (English/Turkish)
- Secure session management
- File uploads for resumes and profile pictures

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Sequelize ORM)
- **Frontend:** EJS Templating, Bootstrap 5
- **Email:** Nodemailer
- **Deployment:** Ready for Vercel

## ⚙️ Installation
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/jobportal.git
   cd jobportal
   ```
2. Run npm install
   ```bash
   npm install
   ```
3. Copy .env.example to .env
   ```bash
   cp .env.example .env
   ```
4. Configure your .env file
   ```
   DB_NAME=your_database_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=3306
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   SESSION_SECRET=your_secret_key
   PORT=3050
   ```
5. Run database migrations
   The application automatically syncs the database on start.
   
6. Run npm start
   ```bash
   npm start
   ```
   For development:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default 3306)
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP port
- `SMTP_USER`: SMTP email user
- `SMTP_PASS`: SMTP password
- `SMTP_FROM`: From email address
- `SESSION_SECRET`: Secret for session management
- `PORT`: Application port (default 3050)

## 📸 Screenshots
*(Add screenshots here)*

## 🌐 Live Demo
[Add Vercel URL after deployment]

## 📄 License
MIT
