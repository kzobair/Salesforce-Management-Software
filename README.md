# FGL Salesforce Management Platform

A comprehensive salesforce management system for tracking client meetings, sales pipelines, deliveries, and KPI performance.

## Features

- **User Authentication** - Role-based access (Super User / KAM) with approval workflow
- **Meetings Management** - Track client meetings with detailed notes
- **Pipeline Tracking** - Monitor confirmed sales with delivery status
- **Delivered Clients** - Track successful deliveries with KPI scores
- **KPI Assignments** - Set and monitor monthly targets for KAMs
- **KAM Rankings** - View performance rankings (Super User only)
- **Multi-currency Support** - BDT and USD
- **Multiple Capacity Units** - Mbps, Gbps, IPLC

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 6.0+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python init_superuser.py  # Create default admin
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Environment Variables

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fgl_salesforce
JWT_SECRET_KEY=your-secret-key
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super User | admin@fgl.com | Admin@123 |

## Documentation

- [User Manual](docs/USER_MANUAL.md)
- [Installation Guide](docs/INSTALLATION_GUIDE.md)
- [FAQ](docs/FAQ.md)

## Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application
│   ├── models.py           # Pydantic models
│   ├── auth_utils.py       # JWT authentication
│   ├── dependencies.py     # Database dependencies
│   └── routes/             # API route handlers
├── frontend/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── components/     # Reusable components
│   │   └── contexts/       # React contexts
│   └── public/
└── docs/                   # Documentation
```

## API Documentation

When running, visit: `http://localhost:8001/docs` for Swagger UI

## License

Proprietary - FiberAtHome Limited
