# ใช้ Python version ที่เหมาะสม
FROM python:3.10-slim

# ตั้งค่า Working Directory ใน Container
WORKDIR /app

# ติดตั้ง dependencies สำหรับ psycopg2 (เพื่อให้คุยกับ PostgreSQL ได้)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ก๊อปปี้ไฟล์ requirements และติดตั้ง Library
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ก๊อปปี้โค้ดทั้งหมดเข้าเครื่อง Container
COPY . .

# กำหนด Port ที่ Flask จะรัน (ปกติคือ 5000)
EXPOSE 5000

# คำสั่งรัน App โดยใช้ gunicorn เพื่อความเสถียร
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]