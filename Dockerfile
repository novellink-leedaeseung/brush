FROM node:20-alpine
WORKDIR /app

# package.json과 package-lock.json만 먼저 복사
COPY package*.json ./

# 개발 의존성 포함하여 설치 (개발 환경이므로)
RUN npm ci

# 소스 복사 (개발 환경에서는 볼륨 마운트로 대체될 수 있음)
COPY . .

# 보안을 위한 퍼미션 설정
RUN chown -R node:node /app
USER node

EXPOSE 80
CMD ["npm","run","dev"]