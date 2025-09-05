# Redis 캐싱 도입에 따른 API 응답 속도 향상 비교 시스템

## 프로젝트 개요
Redis 캐싱을 도입했을 때 API 응답 속도가 얼마나 향상되는지를 측정하고 시각화하는 Spring Boot + React 기반 시스템입니다.

## 기술 스택
- **Backend**: Spring Boot 3.2.0, Java 17
- **Frontend**: React 18, Ant Design, Recharts
- **Database**: H2 (개발용), MySQL (운영용)
- **Cache**: Redis
- **Build Tool**: Maven (Backend), npm (Frontend)
- **Monitoring**: Spring Boot Actuator, Micrometer

## 주요 기능
1. **캐시 사용/미사용 API 비교**
   - 동일한 데이터를 캐시 사용/미사용으로 조회하는 API 제공
   - 각 요청의 응답 시간 측정 및 기록

2. **성능 메트릭 수집**
   - 응답 시간 측정
   - 캐시 적중률 계산
   - 통계 데이터 제공

3. **모니터링**
   - Spring Boot Actuator를 통한 헬스체크
   - Prometheus 메트릭 수집

## 프로젝트 구조
```
├── src/main/java/com/example/rediscacheperformance/  # 백엔드 (Spring Boot)
│   ├── RedisCachePerformanceApplication.java
│   ├── config/
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   └── service/
├── frontend/                                # 프론트엔드 (React)
│   ├── src/
│   │   ├── App.js
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── public/
└── start-all.bat                           # 실행 스크립트
```

## 실행 방법

### 1. 전체 시스템 실행 (권장)
```bash
# 모든 서비스 한번에 실행
start-all.bat
```

### 2. 개별 실행
```bash
# Redis 서버
start-redis.bat

# 백엔드 (Spring Boot)
start-backend.bat

# 프론트엔드 (React)
cd frontend
npm install
npm start
```

### 3. 애플리케이션 접속
- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:8080
- **H2 콘솔**: http://localhost:8080/h2-console
- **Actuator 헬스체크**: http://localhost:8080/actuator/health

## API 엔드포인트

### 데이터 조회 API
- `GET /api/data/all/without-cache` - 모든 데이터 조회 (캐시 미사용)
- `GET /api/data/all/with-cache` - 모든 데이터 조회 (캐시 사용)
- `GET /api/data/category/{category}/without-cache` - 카테고리별 조회 (캐시 미사용)
- `GET /api/data/category/{category}/with-cache` - 카테고리별 조회 (캐시 사용)
- `GET /api/data/{id}/without-cache` - ID별 조회 (캐시 미사용)
- `GET /api/data/{id}/with-cache` - ID별 조회 (캐시 사용)

### 성능 측정 API
- `GET /api/performance/data/without-cache` - 성능 측정 포함 데이터 조회 (캐시 미사용)
- `GET /api/performance/data/with-cache` - 성능 측정 포함 데이터 조회 (캐시 사용)
- `GET /api/performance/statistics` - 성능 통계 조회
- `POST /api/performance/cache/clear` - 캐시 클리어

## 사용법

1. **프론트엔드 접속**: http://localhost:3000
2. **"캐시 미사용 테스트"** 버튼으로 기본 성능 측정
3. **"캐시 사용 테스트"** 버튼으로 캐시 성능 측정 (여러 번 클릭하여 캐시 히트 확인)
4. **실시간 차트**에서 성능 비교 확인
5. **통계 카드**에서 평균 응답시간과 캐시 적중률 확인

## 설정 파일

### application.yml 주요 설정
- **서버 포트**: 8080
- **데이터베이스**: H2 (개발용)
- **Redis**: localhost:6379
- **캐시 TTL**: 10분
- **로깅**: DEBUG 레벨

## 개발 환경 설정

### 필수 요구사항
- **Java 17** 이상
- **Maven 3.6** 이상
- **Node.js 16** 이상
- **Redis 서버**

### IDE 설정
- **IntelliJ IDEA** 또는 Eclipse (백엔드)
- **VS Code** 또는 WebStorm (프론트엔드)
- **Lombok 플러그인** 설치 권장
- **Spring Boot 플러그인** 설치 권장

## 향후 개선 사항
- **실시간 WebSocket 연동**: 실시간 성능 모니터링
- **다양한 캐싱 전략 실험**: TTL, LRU 등
- **동시성/부하 테스트**: 동시 요청 처리 성능
- **다양한 데이터 타입**: 이미지, 파일 등 캐싱 효과 비교
- **PWA 기능**: 오프라인 지원
