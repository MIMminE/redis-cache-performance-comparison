# Spring Cache 스타터 의존성 및 사용 기능 정리

## 프로젝트 개요

이 프로젝트는 **Redis 캐싱 도입에 따른 API 응답 속도 향상 비교 시스템**으로, 스프링 부트와 Redis를 활용하여 캐시 사용 전후의 성능 차이를 측정하고 비교하는 시스템입니다.

### 주요 목적
- Redis 캐시 도입 전후의 API 응답 시간 비교
- 캐시 적중률 측정 및 성능 메트릭 수집
- 다양한 캐시 키 전략 구현 및 테스트
- 캐시 관리 기능 제공 (캐시 클리어, 통계 조회)

### 시스템 아키텍처
- **Backend**: Spring Boot 3.2.0 + Redis + H2 Database
- **Frontend**: React (성능 측정 대시보드)
- **캐시**: Redis (Lettuce 클라이언트 사용)
- **모니터링**: Spring Actuator + Prometheus

## 1. 프로젝트에서 사용된 의존성

### Maven 의존성 (pom.xml)
```xml
<!-- Spring Boot Cache -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- Spring Boot Data Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

## 2. 애플리케이션 설정

### 메인 애플리케이션 클래스
```java
@SpringBootApplication
@EnableCaching  // 캐시 기능 활성화
public class RedisCachePerformanceApplication {
    // ...
}
```

### application.yml 설정
```yaml
# 캐시 설정
cache:
  type: redis
  redis:
    time-to-live: 600000  # 10분 (밀리초)
    cache-null-values: false

# Redis 설정
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: 
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: -1ms
```

## 3. Redis 캐시 설정 클래스

### RedisConfig.java
```java
@Configuration
public class RedisConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)) // 기본 TTL 10분
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}
```

### RedisConfig 파라미터 상세 설명

#### 1. RedisCacheConfiguration 설정
```java
RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
```

**defaultCacheConfig()**: 기본 캐시 설정을 생성합니다.
- 기본 TTL: 무제한 (영구)
- 키 직렬화: JdkSerializationRedisSerializer
- 값 직렬화: JdkSerializationRedisSerializer
- null 값 캐싱: true

#### 2. TTL (Time To Live) 설정
```java
.entryTtl(Duration.ofMinutes(10))
```

**entryTtl()**: 캐시 엔트리의 생존 시간을 설정합니다.
- **Duration.ofMinutes(10)**: 10분 후 자동 만료
- **다른 옵션들**:
  - `Duration.ofSeconds(30)`: 30초
  - `Duration.ofHours(1)`: 1시간
  - `Duration.ofDays(1)`: 1일
  - `Duration.ZERO`: 즉시 만료 (캐시 비활성화)

#### 3. 키 직렬화 설정
```java
.serializeKeysWith(RedisSerializationContext.SerializationPair
        .fromSerializer(new StringRedisSerializer()))
```

**StringRedisSerializer**: Redis 키를 문자열로 직렬화합니다.
- **장점**: 
  - 사람이 읽기 쉬운 형태
  - Redis CLI에서 직접 확인 가능
  - 디버깅 용이
- **단점**: 
  - 복잡한 객체는 직렬화 불가
  - 메모리 사용량 증가 가능

**다른 직렬화 옵션들**:
- `JdkSerializationRedisSerializer`: Java 기본 직렬화 (바이너리)
- `GenericJackson2JsonRedisSerializer`: JSON 형태로 직렬화
- `Jackson2JsonRedisSerializer`: 특정 클래스용 JSON 직렬화

#### 4. 값 직렬화 설정
```java
.serializeValuesWith(RedisSerializationContext.SerializationPair
        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
```

**GenericJackson2JsonRedisSerializer**: 캐시 값을 JSON 형태로 직렬화합니다.
- **장점**:
  - 사람이 읽기 쉬운 JSON 형태
  - 다른 언어/시스템과 호환 가능
  - 타입 정보 포함 (클래스명 저장)
- **단점**:
  - 직렬화/역직렬화 오버헤드
  - 바이너리 직렬화보다 큰 메모리 사용

**JSON 직렬화 특징**:
```json
{
  "@class": "com.example.rediscacheperformance.entity.SampleData",
  "id": 1,
  "name": "Sample Data",
  "category": "test"
}
```

#### 5. RedisCacheManager 빌더
```java
return RedisCacheManager.builder(connectionFactory)
        .cacheDefaults(config)
        .build();
```

**RedisCacheManager.builder()**: Redis 캐시 매니저를 빌드합니다.

**connectionFactory**: Redis 연결 팩토리 (application.yml에서 설정)
- LettuceConnectionFactory (기본값)
- JedisConnectionFactory (대안)

**cacheDefaults(config)**: 모든 캐시에 적용될 기본 설정
- 위에서 정의한 RedisCacheConfiguration 사용

**추가 설정 옵션들**:
```java
RedisCacheManager.builder(connectionFactory)
    .cacheDefaults(config)
    .withCacheConfiguration("sampleData", RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))) // 특정 캐시만 다른 TTL
    .withCacheConfiguration("userCache",  RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))) // 사용자 캐시는 1시간
    .build();
```

#### 6. Redis 연결 풀 설정 (application.yml)
```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 8    # 최대 활성 연결 수
          max-idle: 8      # 최대 유휴 연결 수
          min-idle: 0      # 최소 유휴 연결 수
          max-wait: -1ms   # 연결 대기 시간 (-1: 무제한)
```

**연결 풀 파라미터 설명**:
- **max-active**: 동시에 사용할 수 있는 최대 연결 수
- **max-idle**: 풀에서 유지할 최대 유휴 연결 수
- **min-idle**: 풀에서 유지할 최소 유휴 연결 수
- **max-wait**: 연결을 기다리는 최대 시간

#### 7. Redis 서버 설정 (application.yml)
```yaml
spring:
  data:
    redis:
      host: localhost      # Redis 서버 호스트
      port: 6379          # Redis 서버 포트
      password:           # Redis 인증 비밀번호 (없으면 빈 문자열)
      timeout: 2000ms     # 연결 타임아웃
```

**Redis 서버 파라미터 설명**:
- **host**: Redis 서버의 IP 주소 또는 도메인명
- **port**: Redis 서버의 포트 번호 (기본값: 6379)
- **password**: Redis 인증 비밀번호 (보안 설정 시 필요)
- **timeout**: Redis 명령 실행 타임아웃

## 4. 사용된 캐시 어노테이션

### @Cacheable 어노테이션 사용 예시
```java
@Service
public class DataService {
    
    // 전체 데이터 조회 (캐시 사용)
    @Cacheable(value = "sampleData", key = "'all'")
    public List<SampleData> getAllDataWithCache() {
        // ...
    }
    
    // 카테고리별 데이터 조회 (캐시 사용)
    @Cacheable(value = "sampleData", key = "#category")
    public List<SampleData> getDataByCategoryWithCache(String category) {
        // ...
    }
    
    // ID로 데이터 조회 (캐시 사용)
    @Cacheable(value = "sampleData", key = "#id")
    public Optional<SampleData> getDataByIdWithCache(Long id) {
        // ...
    }
}
```

## 5. 캐시 관리 기능

### CacheManager를 통한 캐시 제어
```java
@RestController
public class PerformanceController {
    
    private final CacheManager cacheManager;
    
    // 캐시 클리어 API
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearCache() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            cacheManager.getCache(cacheName).clear();
        });
        return ResponseEntity.ok(Map.of("message", "Cache cleared successfully"));
    }
}
```
