# TikTok Techjam Backend

### API Routes
- Create user  
POST /user
- Update user
PUT /user
- Post live videos  
POST /content
- Get content quality  
GET /content/:contentId/quality
- Get reward breakdown for creators  
GET /reward/:creatorId/breakdown
- Get reward totals for creators
GET /reward/:creatorId/total
- Send gifts to creators  
POST /gift
- Manually Report fraud activity  
POST /fraud

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

2. Backend:  
- Rename .env.development to .env
- npm install
- npm run prestart (build prisma client)
- npm run dev  

3. ML:  
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
- Quality: python train_content_quality_model.py
- Compliance: python train_compliance_model.py
- Audit Log Anomaly: python train_anomaly_model.py

Existing models are pretrained

### ML Architecture
Multi-Stream Reward Distribution:  
Creator Reward =  Consumer Gifts (40% weight) + Advertisement Revenue (30% weight based on views and watch time) + Creator Fund (30% weight based on AI content quality score)    

AI Generated Content Quality:  
Overall Content Quality Score = Content Quality (75% weight)  + Community Compliance Score (25% weight)