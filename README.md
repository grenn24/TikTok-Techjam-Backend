# TikTok Techjam Backend

### Routes
- Create /update user  
/user
- Post live videos  
/content
- Get reward breakdown for creators  
/reward
- Send gifts to creators  
/gift
- Report fraud activity  
/fraud

### Setup  
1. Create a /config directory with the following files:
- custom-environment-variables.json
- development.json
- production.json

Add this to custom-environment-variables.json:  
{
    "PORT": "PORT",
    "ML_PORT": "ML_PORT",
    "SECRET_KEY": "SECRET_KEY"
}
Add this to development.json:  
{
	"NODE_ENV": "development",
	"PORT": 3000,
	"DATABASE_URL": "postgres://<password>@localhost:5433/database-name",
}

Open 2 terminal windows  
2. Backend:  
- Rename .env.development to .env
- npm install
- npm run prestart (build prisma client)
- npm run dev  

3. ML:  
- python -m venv venv
- source venv/bin/activate  # Linux/Mac
- source venv/Scripts/activate  # Windows
- pip install -r requirements.txt
- uvicorn app:app --reload --port 8001
- change Python interpreter to the one located inside venv/Scripts
- python train_model.py  # train model

### Ports
- Port 3000: Backend API
- Port 8001: ML Server