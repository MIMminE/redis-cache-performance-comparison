# Redis 사용 사례 및 특징 분석

## 목차
1. [Redis 개요](#redis-개요)
2. [주요 사용 사례](#주요-사용-사례)
3. [사례별 특징 분석](#사례별-특징-분석)
4. [기존 방식과의 비교](#기존-방식과의-비교)
5. [성능 비교](#성능-비교)
6. [선택 기준](#선택-기준)

---

## Redis 개요

Redis(Remote Dictionary Server)는 **인메모리 데이터 구조 저장소**로, 다양한 데이터 타입을 지원하는 NoSQL 데이터베이스입니다.

### 핵심 특징
- **메모리 기반**: 디스크보다 10-100배 빠른 속도
- **다양한 데이터 타입**: String, Hash, List, Set, Sorted Set 등
- **원자성 연산**: 동시성 문제 해결
- **분산 환경 지원**: 여러 서버가 공유 가능
- **영속성 옵션**: RDB, AOF 지원

---

## 주요 사용 사례

### 1. 캐싱 (Caching)

#### 특징
- **메모리 기반**으로 빠른 데이터 조회
- **TTL(Time To Live)** 지원으로 자동 만료
- **분산 캐시**로 여러 서버가 공유

#### 구현 예시
```java
@Cacheable(value = "userData", key = "#userId")
public User getUserById(Long userId) {
    return userRepository.findById(userId);
}
```

#### 기존 방식과 비교
| 구분 | DB 방식 | Redis 방식 |
|------|---------|------------|
| 응답 시간 | 50-100ms | 1-5ms |
| 메모리 사용 | 낮음 | 높음 |
| 확장성 | 제한적 | 우수 |
| 데이터 일관성 | 높음 | TTL에 의존 |

---

### 2. 세션 저장소 (Session Store)

#### 특징
- **분산 세션** 관리
- **자동 만료** 기능
- **고가용성** 보장

#### 구현 예시
```java
@PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    String sessionId = UUID.randomUUID().toString();
    redisTemplate.opsForValue().set("session:" + sessionId, user, 30, TimeUnit.MINUTES);
    return sessionId;
}
```

#### 기존 방식과 비교
| 구분 | 메모리 세션 | Redis 세션 |
|------|-------------|------------|
| 확장성 | 단일 서버 | 다중 서버 |
| 고가용성 | 낮음 | 높음 |
| 메모리 관리 | 수동 | 자동 |
| 로드 밸런싱 | 제한적 | 유연함 |

---

### 3. 실시간 채팅 (Real-time Chat)

#### 특징
- **Pub/Sub** 패턴으로 실시간 브로드캐스트
- **1:N 통신** 지원
- **즉시 전달** 가능

#### 구현 예시
```java
// 메시지 발행
@PostMapping("/chat/send")
public void sendMessage(@RequestBody ChatMessage message) {
    redisTemplate.convertAndSend("chat:room:" + message.getRoomId(), message);
}

// 메시지 구독
@EventListener
public void handleMessage(String message) {
    // 실시간으로 메시지 처리
}
```

#### 기존 방식과 비교
| 구분 | DB 폴링 | Redis Pub/Sub |
|------|---------|---------------|
| 응답 시간 | 1-5초 | 0.1-1ms |
| 서버 부하 | 높음 | 낮음 |
| 실시간성 | 제한적 | 우수 |
| 확장성 | 어려움 | 쉬움 |

---

### 4. 실시간 랭킹 시스템 (Real-time Ranking)

#### 특징
- **Sorted Set**으로 자동 정렬
- **원자성 연산**으로 동시성 보장
- **실시간 집계** 가능

#### 구현 예시
```java
// 점수 업데이트
public void updateScore(String playerId, int score) {
    redisTemplate.opsForZSet().add("game:ranking", playerId, score);
}

// 상위 10명 조회
public List<String> getTopPlayers() {
    return redisTemplate.opsForZSet().reverseRange("game:ranking", 0, 9);
}
```

#### 기존 방식과 비교
| 구분 | DB 정렬 | Redis Sorted Set |
|------|---------|------------------|
| 응답 시간 | 100-500ms | 1-10ms |
| 동시성 | 문제 발생 | 원자성 보장 |
| 정렬 성능 | O(n log n) | O(log n) |
| 메모리 사용 | 낮음 | 높음 |

---

### 5. API Rate Limiting (API 제한)

#### 특징
- **원자성 카운터** 연산
- **TTL 기반** 자동 리셋
- **분산 환경** 지원

#### 구현 예시
```java
public boolean isAllowed(String ip) {
    String key = "rate_limit:" + ip;
    Long count = redisTemplate.opsForValue().increment(key);
    
    if (count == 1) {
        redisTemplate.expire(key, 1, TimeUnit.MINUTES);
    }
    
    return count <= 100; // 분당 100회 제한
}
```

#### 기존 방식과 비교
| 구분 | 메모리 카운터 | Redis 카운터 |
|------|---------------|--------------|
| 확장성 | 단일 서버 | 다중 서버 |
| 정확성 | 부정확 | 정확 |
| 메모리 관리 | 수동 | 자동 |
| 동시성 | 문제 발생 | 원자성 보장 |

---

### 6. 실시간 통계 (Real-time Statistics)

#### 특징
- **고빈도 업데이트** 처리
- **원자성 연산**으로 정확성 보장
- **실시간 집계** 가능

#### 구현 예시
```java
// 조회수 증가
public void incrementPageView(String pageId) {
    redisTemplate.opsForValue().increment("page_views:" + pageId);
}

// 실시간 조회수 조회
public Long getPageViews(String pageId) {
    return redisTemplate.opsForValue().get("page_views:" + pageId);
}
```

#### 기존 방식과 비교
| 구분 | DB 업데이트 | Redis 카운터 |
|------|-------------|--------------|
| 응답 시간 | 50-100ms | 1-5ms |
| 동시성 | 문제 발생 | 원자성 보장 |
| 처리량 | 1,000 TPS | 100,000+ TPS |
| 정확성 | 부정확 | 정확 |

---

## 성능 비교

### 응답 시간 비교
```
DB (디스크): 50-100ms
Redis (메모리): 1-5ms
성능 향상: 10-100배
```

### 처리량 비교
```
DB: 1,000-10,000 TPS
Redis: 100,000+ TPS
처리 능력: 10-100배 향상
```

### 메모리 사용량
```
DB: 낮음 (디스크 기반)
Redis: 높음 (메모리 기반)
```

---

## 선택 기준

### Redis를 선택해야 하는 경우

#### ✅ 적합한 경우
- **실시간성**이 중요한 경우
- **고빈도 읽기/쓰기**가 필요한 경우
- **분산 환경**에서 데이터 공유가 필요한 경우
- **복잡한 데이터 구조**가 필요한 경우
- **빠른 응답 시간**이 중요한 경우

#### ❌ 부적합한 경우
- **대용량 영구 저장**이 필요한 경우
- **복잡한 쿼리**가 필요한 경우
- **ACID 트랜잭션**이 중요한 경우
- **메모리 제약**이 있는 경우

### 기존 방식 vs Redis 선택 기준

| 요구사항 | DB | Redis | 선택 기준 |
|----------|----|----|-----------|
| 실시간성 | ❌ | ✅ | Redis |
| 영구 저장 | ✅ | ⚠️ | DB |
| 복잡한 쿼리 | ✅ | ❌ | DB |
| 빠른 응답 | ❌ | ✅ | Redis |
| 분산 환경 | ❌ | ✅ | Redis |
| 메모리 효율 | ✅ | ❌ | DB |

---

## 결론

Redis는 **실시간성과 성능**이 중요한 현대 웹 서비스에서 필수적인 기술입니다.

### 핵심 장점
1. **속도**: 메모리 기반으로 10-100배 빠름
2. **실시간성**: Pub/Sub로 즉시 전달
3. **확장성**: 분산 환경에서 공유 가능
4. **다양성**: 다양한 데이터 타입 지원

### 사용 권장 사례
- **캐싱**: 웹 애플리케이션 성능 향상
- **실시간 기능**: 채팅, 알림, 랭킹
- **세션 관리**: 분산 환경에서 세션 공유
- **Rate Limiting**: API 보호 및 제한
- **실시간 통계**: 고빈도 카운팅 및 집계

**Redis는 단순한 캐시를 넘어서 현대 웹 서비스의 핵심 인프라**로 자리잡고 있습니다.
