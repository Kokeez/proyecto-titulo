# Proyecto Título

Este es un proyecto fullstack compuesto por:

-  **Frontend:** React (JS) servido por Node.js con Webpack
-  **Backend:** Django (Python) con Django REST Framework
-  Comunicación entre frontend y backend vía API REST (`fetch`)

---

## Instalación y ejecución local

### 1. Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows

pip install -r requirements.txt  # o instalar manualmente:
pip install django djangorestframework django-cors-headers

python manage.py runserver

Servidor se inicia en: http://localhost:8000


### 2. Frontend (react+node.js)

cd frontend/client
npm install
npm start

React se inicia desde http://localhost:3000

### Si tienes un error CORS debes configurar el django con el puerto que tienes en el backend

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]


