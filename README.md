# TikTok Techjam Backend

### API Routes
https://web.postman.co/workspace/My-Workspace~09c6ec3d-2d55-41d1-8fe8-469094d4a5d2/collection/40285423-a3c27248-4cde-495e-8e7c-cc58b4a93281?action=share&source=copy-link&creator=40285423  
Public Routes:  
- Log in
POST /auth/login  
- Sign Up (Create user)  
POST /auth/signup

Protected Routes: (Require Authorization: Bearer header)  
- Update user
PUT /user/:id  

- Get content by a user
GET /content
- Post live videos  
POST /content
- Get content engagement score
GET /content/:contentId/engagement-score
- Get content quality score
GET /content/:contentId/quality-score

- Get reward breakdown for creators  
GET /reward/:creatorId/breakdown
- Get reward totals for creators
GET /reward/:creatorId/total

- Send gifts to a content 
POST /gift

- Manually Report fraud activity  
POST /fraud

- Get all audit logs  
GET /audit
- Get audit log by id
GET /audit/:id
- Scan audit logs  
POST /audit/scan
- List flagged audit logs
GET /audit/flagged
- Flag an audit log
POST /audit/:id/flag

### Setup Locally  
1. Create a /config directory with the following files:
- custom-environment-variables.json
- development.json
- production.json

Add this to custom-environment-variables.json:  
```json
{
    "PORT": "PORT",
    "ML_PORT": "ML_PORT",
    "SECRET_KEY": "SECRET_KEY"
}
```
Add this to development.json: 
```json 
{
	"NODE_ENV": "development",
	"PORT": 3000,
	"DATABASE_URL": "postgres://<password>@localhost:5433/<database-name>",
}
```

2. Check that u have psql installed (https://www.postgresql.org/download/windows/)

3. Backend:  
- Rename .env.development to .env
- npm install
- npm run prestart (build prisma client)
- npm run dev  

4. ML:  
- python -m venv venv
- source venv/bin/activate  # Linux/Mac
- source venv/Scripts/activate  # Windows
- change Python interpreter to the one located inside venv/Scripts
- pip install -r requirements.txt
- uvicorn app:app --reload --log-level debug --port 8001

### Ports
- 3000: Backend API
- 8001: ML Server

### Training ML Models 
- Engagement: python train_engagement_model.py
- Content Quality: python train_content_quality_model.py
- Audit Log Anomaly: python train_anomaly_model.py

Can also use existing pretrained models

### ML Architecture
Multi-Stream Reward Distribution:  
Creator Reward =  Consumer Gifts (40% weight) + Advertisement Revenue (30% weight based on views and watch time) + Creator Fund (30% weight based on AI overall content quality score)    

AI Generated Content Quality:  
Content Quality Score = Content Engagement Score (50% weight)  + Content Quality Score (50% weight)