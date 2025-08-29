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
- Rename .env.development to .env
- npm install
- npm run dev

- python -m venv venv
- source venv/bin/activate        # Linux/Mac
- venv/Scripts/activate           # Windows
- pip install -r requirements.txt
- uvicorn app:app --reload --port 8001
- change Python interpreter to the one inside venv

### Ports
- Port 3000: Backend API
- Port 8001: ML Server