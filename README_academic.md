# Expense Tracker — Personal Expense Management System

A **Personal Expense Management System** developed as an academic final project using **Django (Python), SQLite, HTML5, CSS3 and JavaScript**. The system lets each registered user record income and expenses, review their history, and analyse their spending through weekly, monthly and yearly reports.

> **Academic note:** Bootstrap, jQuery, DataTables and Chart.js are used as frontend support libraries for responsive layout, tables and charts. The application's business logic, database design, authentication, session handling, transaction, reporting, export and password-reset workflows are implemented in Django/Python and project-specific templates, JavaScript and CSS.

---

## 1. Project Overview

Expense Tracker is designed to computerize everyday personal finance record-keeping, including:

- User registration and login
- Profile management with photo upload
- Income and expense recording
- Expense categorisation
- Transaction editing and deletion
- Balance calculation (income minus expenses)
- Transaction history with date and category search
- Weekly, monthly and yearly expense reports
- Chart-based spending analysis
- Savings-exceeded warnings
- CSV export of transaction history
- Email-based password reset
- Login lockout and session timeout

The current scope is a **single-database, multi-user web application**. Each user can see only their own data. No bank or payment-gateway integration is included; all amounts are entered manually by the user.

---

## 2. Technology Stack

| Technology / Resource | Purpose |
|---|---|
| **Python 3.x** | Server-side application logic |
| **Django 6.0** | Web framework (MVT), URL routing, authentication, sessions, ORM |
| **SQLite 3** | Relational database (`db.sqlite3`) |
| **Django ORM** | Database access, queries, aggregation and migrations |
| **Pillow** | Profile-photo (`ImageField`) handling |
| **HTML5** | Page structure and forms (Django templates) |
| **CSS3** | Project-specific styling |
| **JavaScript** | Client-side interaction and chart rendering |
| **Bootstrap 4.5** | Responsive grid, forms, buttons, cards and tables |
| **jQuery 3.5** | DOM handling and DataTables support |
| **DataTables 1.10** | Sortable and searchable history tables |
| **Chart.js 2.x** | Expense charts |
| **Font Awesome 5** | Interface and sidebar icons |
| **Django built-in auth** | User model, password hashing, password-reset tokens |

### Frontend framework usage

Bootstrap is used only as a **frontend support framework**. It does not provide any expense-tracking logic. The project also contains custom CSS in:

```text
static/home.css
static/index.css
static/profile.css
static/addmoney.css
static/registration.css
static/login1.css
static/aboutus.css
```

Project-specific JavaScript is located in:

```text
static/javascript/scripts.js
static/javascript/weekly.js
static/javascript/stats.js
static/javascript/info.js
```

The libraries listed above are loaded through CDNs in the current version. Therefore, the UI requires internet access for those resources unless they are downloaded and linked locally (see [Offline Use](#11-offline-use)).

---

## 3. User Roles

### User (Customer)

- Register / login / logout
- Manage personal profile (name, email, profession, income, savings)
- Upload or delete a profile photo
- Add income and expense transactions
- Edit and delete transactions
- View dashboard with totals and balance
- View paginated transaction history
- Search history by date range and category
- View weekly, monthly and yearly reports and charts
- Export history as CSV
- Reset a forgotten password by email

### Administrator

- Access the Django admin site at `/admin/`
- View and manage transactions (`Addmoney_info`)
- View and manage user profiles (`UserProfile`)
- View and manage active sessions
- Manage user accounts through Django's built-in user administration

> The administrator is created with `python manage.py createsuperuser`. There is no separate custom admin panel in the current version.

---

## 4. Main Application Workflow

### Registration and login workflow

```text
User opens Register page
          ↓
Enters username, name, email, profession, income, savings, password
          ↓
Server validates username (unique, max 15 chars, letters/numbers only)
          ↓
Server checks that both passwords match
          ↓
Account created (password hashed) + UserProfile created
          ↓
User logs in
          ↓
Server authenticates credentials
          ↓
Session created (is_logged, user_id)
          ↓
User is redirected to the dashboard
```

After **5 failed login attempts**, the user is locked out for **60 seconds**. Sessions expire after **10 minutes** of inactivity.

### Add transaction workflow

```text
Logged-in User
      ↓
Open Add Money page
      ↓
Select Income / Expense, amount, date, category
      ↓
Server checks the session
      ↓
Server validates the amount
      ↓
Expense amounts are stored as negative values
      ↓
Transaction saved in SQLite, linked to the user
      ↓
User is redirected to the home page with a success message
```

### Report workflow

```text
User selects Weekly / Monthly / Yearly report
          ↓
Server filters the user's transactions by date window
          ↓
Server groups expenses by category and sums them
          ↓
Totals are compared with the savings stored in the profile
          ↓
Data is sent to Chart.js (JSON / template context)
          ↓
Chart and warning message (if any) are displayed
```

### Password-reset workflow

```text
User enters registered email
          ↓
Server finds the user
          ↓
Secure token and encoded user id generated
          ↓
Reset link emailed to the user
          ↓
User opens link and sets a new password
          ↓
Token becomes invalid after use
```

Totals and reports are calculated on the **server side** using database aggregation (`Sum`), not by trusting values submitted from the browser.

---

## 5. Database

The database file is located at:

```text
db.sqlite3
```

The schema is defined by Django models in `home/models.py` and applied through migrations in `home/migrations/`.

The application defines the following main tables:

```text
auth_user              (Django built-in)
home_addmoney_info     (transactions)
home_userprofile       (profile data)
```

Django also creates standard framework tables such as `django_session`, `auth_group`, `auth_permission`, `django_content_type`, `django_migrations` and `django_admin_log`.

| Table | Main columns |
|---|---|
| `auth_user` | id, username, password (hashed), first_name, last_name, email, is_staff, is_active, is_superuser, last_login, date_joined |
| `home_addmoney_info` | id, user_id (FK), add_money, quantity, Date, Category |
| `home_userprofile` | id, user_id (FK, one-to-one), profession, income, Savings, profile_image |

The database uses foreign-key relationships with `ON DELETE CASCADE` to maintain data integrity.

### Main relationships

```text
Users (auth_user)
 ├── Transactions (home_addmoney_info)   1 : M
 └── Profile (home_userprofile)          1 : 1
```

Categories are defined as fixed model choices (Food, Travel, Shopping, Necessities, Entertainment, Other) rather than a separate table.

The exact structure should be read from `home/models.py` and `db.sqlite3` when preparing the ER diagram and schema diagram for the academic report.

---

## 6. Security Features

The project includes several server-side security measures:

- Password hashing through Django's authentication system (PBKDF2)
- Session-based login with session keys stored on the server
- Session timeout after 10 minutes of inactivity
- Login lockout after 5 failed attempts (60 seconds)
- Django ORM queries (protection against SQL injection)
- CSRF-token protection for POST forms (`CsrfViewMiddleware`)
- Template auto-escaping (protection against XSS)
- Per-user data filtering on queries (`filter(user=...)`)
- Server-side validation of username, passwords and amounts
- Time-limited, single-use password-reset tokens
- Session checks on protected views (redirect to login when not logged in)

Security controls should still be reviewed and tested before any real-world deployment. In particular, the current version should add record-ownership checks on edit/delete and profile-update views, use `DEBUG = False`, and move secrets and email credentials into environment variables.

---

## 7. Installation — Local Setup

### Requirements

- Windows / Linux / macOS
- Python 3.10 or newer
- pip
- A modern web browser

### Steps

1. Install Python and verify it:

```text
python --version
```

2. Copy or clone the project folder, for example:

```text
D:\Expense-Tracker-main
```

3. Open a terminal in the project folder and create a virtual environment:

```text
python -m venv venv
```

4. Activate it:

```text
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

5. Install the dependencies:

```text
pip install django pillow
```

> The bundled `requirements.txt` is a full `pip freeze` saved in UTF-16 and contains many unrelated packages. Installing `django` and `pillow` directly is enough to run the project.

6. Apply the database migrations:

```text
python manage.py migrate
```

7. (Optional) Create an administrator account:

```text
python manage.py createsuperuser
```

8. Start the development server:

```text
python manage.py runserver
```

9. Open:

```text
http://127.0.0.1:8000/
```

The Django admin site is available at:

```text
http://127.0.0.1:8000/admin/
```

### Password-reset email

The current settings use Django's **console email backend**, so the reset link is printed in the terminal where `runserver` is running. To send real emails, configure SMTP in `ExpenseTracker/settings.py`:

```text
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = '<your-email>'
EMAIL_HOST_PASSWORD = '<app-password>'
```

---

## 8. Demo Accounts

No fixed demo credentials are documented for this project. To test the system:

```text
User:   register a new account at /register/
Admin:  create one with: python manage.py createsuperuser
```

The supplied `db.sqlite3` already contains a small number of test user accounts created during development. For any deployment outside the academic/local environment, delete test accounts and use strong, unique passwords.

---

## 9. Project Structure

```text
Expense-Tracker-main/
│
├── manage.py              # Django command-line utility
├── db.sqlite3             # SQLite database
├── requirements.txt       # Python dependencies
├── ExpenseTracker/        # Project configuration
│   ├── settings.py        # Apps, middleware, database, sessions, media, email
│   ├── urls.py            # Root URL configuration (admin + app routes)
│   └── wsgi.py / asgi.py
├── home/                  # Main application
│   ├── models.py          # Addmoney_info and UserProfile models
│   ├── views.py           # Application logic
│   ├── urls.py            # Application routes
│   ├── admin.py           # Admin-site registrations
│   ├── apps.py, tests.py
│   └── migrations/        # Database migrations
├── templates/
│   ├── base.html, base1.html, base2.html   # Shared layouts
│   └── home/              # Page templates (login, register, index, dashboard,
│                          #   addmoney, tables, weekly, stats, info, profile, ...)
├── static/
│   ├── javascript/        # Project JavaScript
│   ├── img/               # Images
│   └── *.css              # Custom CSS
├── media/
│   └── profile_pics/      # Uploaded profile photos
└── README.md
```

---

## 10. Application Architecture

The project follows Django's **Model-View-Template (MVT)** approach:

```text
Browser
   ↓
URL Routing (urls.py)
   ↓
View Function (views.py)
   ↓
Session / Authentication + Validation
   ↓
Business Logic
   ↓
Django ORM (models.py)
   ↓
SQLite
   ↓
HTML Template / JSON / CSV Response
   ↓
Browser
```

Application logic is kept in `home/views.py`, data definitions in `home/models.py`, and project configuration in `ExpenseTracker/settings.py`.

---

## 11. Offline Use

The application itself runs locally, but the current version loads these frontend dependencies from CDNs:

```text
Bootstrap 4.5.0 CSS / JS bundle
jQuery 3.5.1
DataTables 1.10.20 (CSS / JS)
Chart.js 2.8.0 / 2.9.4
Font Awesome 5.13.0 / 5.15.4
```

Therefore, the UI and charts require internet access for those files in the current version.

For a fully offline demonstration, download the corresponding files into `static/`, then replace the CDN `<link>` and `<script>` references in the templates under:

```text
templates/base.html
templates/base1.html
templates/base2.html
templates/home/*.html
```

After that, the application can be demonstrated locally without depending on the CDNs.

---

## 12. Academic Scope and Limitations

This version is intended as an **academic final project** and focuses on demonstrating web-application development fundamentals:

- Requirement-based system design
- Relational database design
- CRUD operations
- Authentication and session management
- Server-side validation
- Basic web security practices
- Data aggregation and reporting
- Chart-based data visualisation
- File upload and CSV export
- Django/SQLite integration
- Practical personal-finance workflows

The project does **not** include:

- Budget limits or per-category spending alerts
- Custom user-defined categories
- Recurring transactions or reminders
- Bank or payment-gateway integration
- Multi-currency support
- Mobile application
- Custom administrator dashboard
- Automated test suite

Known limitations to review:

- Edit/delete and profile-update views should verify that the record belongs to the logged-in user.
- A few views (`expense_month`, `info_year`, `dashboard`) do not use the same login check as the rest.
- The login lockout is session-based and resets if cookies are cleared.
- Sign handling of expenses in edit and savings-comparison logic should be verified.
- `DEBUG = True` and the console email backend are for local development only.

These are outside the current scope or are listed as planned improvements.

---

## 13. Suggested Academic Documentation

For project submission and external evaluation, prepare documentation that matches the implemented system, including:

1. Introduction and problem statement
2. Objectives and scope
3. Requirement analysis
4. Functional and non-functional requirements
5. Feasibility study
6. SRS
7. System architecture
8. Use-case diagram
9. DFD (Level 0, Level 1 and physical DFD)
10. ER diagram
11. Database / schema design
12. UI screenshots
13. Implementation details
14. Testing and test cases
15. Security considerations
16. Limitations
17. Future enhancements
18. Conclusion
19. References

The team should be able to explain the implementation rather than treating Django, Bootstrap or any other library as a substitute for understanding the application's code.

---

## 14. Future Enhancements

Possible future improvements include:

- Budget limits per category with alerts
- Custom user-defined categories
- Recurring transactions and reminders
- Ownership checks on every record and automated tests
- Real email delivery (SMTP) and environment-based secrets
- Migration to PostgreSQL / MySQL for production
- Multi-currency support
- REST API and mobile application
- Advanced analytics and downloadable PDF reports
- Automated database backups

---

## 15. License / Academic Use

This project is intended for educational and academic use. Review and replace test accounts, configuration values and other development settings (`DEBUG`, `SECRET_KEY`, email credentials) before any production deployment.

**Author:** `<your name>`  |  **Institution:** `<college / university>`  |  **Guide:** `<instructor name>`
