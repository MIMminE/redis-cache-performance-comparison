# CORS(Cross-Origin Resource Sharing) 완전 가이드

## CORS란?

**CORS(Cross-Origin Resource Sharing)**는 웹 브라우저의 보안 정책으로, 한 도메인에서 다른 도메인의 리소스에 접근할 때 발생하는 제한을 관리하는 메커니즘입니다.

### 핵심 개념
- **Cross-Origin**: 다른 출처(도메인, 포트, 프로토콜)
- **Resource Sharing**: 리소스 공유
- **목적**: 브라우저에서 실행되는 JavaScript의 보안

## Same-Origin Policy (동일 출처 정책)

### Origin(출처)의 구성 요소
```
https://www.example.com:8080/api/data
│     │                │    │
│     │                │    └─ Path
│     │                └────── Port
│     └─────────────────────── Host
└───────────────────────────── Protocol
```

### Same-Origin vs Cross-Origin

**Same-Origin (같은 출처)**:
- ✅ `https://example.com` → `https://example.com/api`
- ✅ `http://localhost:3000` → `http://localhost:3000/api`

**Cross-Origin (다른 출처)**:
- ❌ `http://localhost:3000` → `http://localhost:8080` (다른 포트)
- ❌ `https://example.com` → `http://example.com` (다른 프로토콜)
- ❌ `https://api.example.com` → `https://web.example.com` (다른 서브도메인)

## CORS가 필요한 이유

### 보안 문제 해결

#### 문제 상황
```javascript
// 악성 사이트 (evil.com)에서 실행
fetch('https://bank.com/api/account')
  .then(response => response.json())
  .then(data => {
    // 은행 계좌 정보를 훔쳐서 해커에게 전송
    sendToHacker(data);
  });
```

#### CORS로 해결
```javascript
// 악성 사이트에서 실행
fetch('https://bank.com/api/account')
  .catch(error => {
    // ✅ 브라우저가 자동으로 차단!
    console.error('CORS Error:', error);
  });
```

### 현재 프로젝트에서의 CORS 문제

#### 문제 상황
```
Frontend (React): http://localhost:3000
Backend (Spring): http://localhost:8080
```

#### 브라우저 에러
```javascript
// Frontend에서 API 호출 시 발생하는 에러
fetch('http://localhost:8080/api/data')
  .catch(error => {
    console.error('CORS Error:', error);
    // Access to fetch at 'http://localhost:8080/api/data' from origin 'http://localhost:3000' 
    // has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
  });
```

## CORS 동작 원리

### 1. Preflight Request (사전 요청)
복잡한 요청의 경우 브라우저가 먼저 OPTIONS 요청을 보냅니다:

```http
OPTIONS /api/data HTTP/1.1
Host: localhost:8080
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### 2. 서버 응답
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 3600
```

### 3. 실제 요청
```http
POST /api/data HTTP/1.1
Host: localhost:8080
Origin: http://localhost:3000
Content-Type: application/json

{"data": "example"}
```

## CORS 헤더 설명

### 서버에서 보내는 CORS 헤더들
- **Access-Control-Allow-Origin**: 허용할 출처
- **Access-Control-Allow-Methods**: 허용할 HTTP 메서드
- **Access-Control-Allow-Headers**: 허용할 요청 헤더
- **Access-Control-Allow-Credentials**: 인증 정보 포함 허용
- **Access-Control-Max-Age**: Preflight 결과 캐시 시간

### 클라이언트에서 보내는 CORS 헤더들
- **Origin**: 요청하는 출처
- **Access-Control-Request-Method**: 실제 요청할 메서드
- **Access-Control-Request-Headers**: 실제 요청할 헤더

## Spring Boot에서의 CORS 설정

### 1. WebMvcConfigurer 방식 (권장)
```java
@Configuration
public class WebConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")  // 어떤 경로에 적용할지
                        .allowedOrigins("http://localhost:3000")  // 어떤 출처를 허용할지
                        .allowedMethods("GET", "POST", "PUT", "DELETE")  // 어떤 HTTP 메서드를 허용할지
                        .allowedHeaders("*")  // 어떤 헤더를 허용할지
                        .allowCredentials(true)  // 쿠키/인증 정보 포함 허용
                        .maxAge(3600);  // Preflight 결과 캐시 시간
            }
        };
    }
}
```

### 2. CorsConfigurationSource 방식
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

### 3. 컨트롤러 레벨 설정
```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class DataController {
    // ...
}
```

## CORS 적용 범위

### CORS가 적용되는 경우
| 통신 유형 | CORS 적용 여부 | 이유 |
|-----------|----------------|------|
| **브라우저 → 서버** | ✅ 적용 | 브라우저의 보안 정책 |
| **웹 애플리케이션** | ✅ 적용 | 브라우저 기반 |
| **SPA (React/Vue/Angular)** | ✅ 적용 | 브라우저에서 실행 |

### CORS가 적용되지 않는 경우
| 통신 유형 | CORS 적용 여부 | 이유 |
|-----------|----------------|------|
| **서버 → 서버** | ❌ 미적용 | 신뢰할 수 있는 환경 |
| **마이크로서비스 간** | ❌ 미적용 | 백엔드 간 통신 |
| **모바일 앱** | ❌ 미적용 | 브라우저가 아님 |
| **Postman/curl** | ❌ 미적용 | 브라우저가 아님 |

## CORS 악용 공격 방식

### 1. CORS Misconfiguration (CORS 설정 오류) 공격

#### 잘못된 CORS 설정
```java
// ❌ 위험한 설정
.allowedOrigins("*")  // 모든 출처 허용!
.allowCredentials(true);  // 인증 정보도 허용!
```

#### 공격 시나리오
```javascript
// 악성 사이트 (evil.com)에서 실행
fetch('https://victim-bank.com/api/account', {
    credentials: 'include'  // 쿠키/인증 정보 포함
})
.then(response => response.json())
.then(data => {
    // 은행 계좌 정보를 가져와서 해커에게 전송
    sendToHacker(data);
});
```

### 2. Subdomain Takeover (서브도메인 탈취) 공격

#### 공격 시나리오
```java
// 백엔드 CORS 설정
.allowedOrigins("https://*.example.com")  // 서브도메인 허용
```

**공격 과정**:
1. 해커가 `https://hacked.example.com` 서브도메인을 탈취
2. 해당 서브도메인에서 악성 JavaScript 실행
3. 허용된 서브도메인이므로 CORS 통과
4. API 서버에 접근하여 데이터 탈취

### 3. Origin Reflection (출처 반사) 공격

#### 취약한 서버 설정
```java
// ❌ 위험한 설정 - 요청한 Origin을 그대로 반환
.allowedOrigins(request.getHeader("Origin"))
```

## 방어 방법

### 1. 안전한 CORS 설정
```java
// ✅ 안전한 설정
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")  // 특정 출처만 허용
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("Content-Type", "Authorization")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    };
}
```

### 2. 환경별 CORS 설정
```java
@Configuration
@Profile("production")
public class ProductionCorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("https://myapp.com", "https://www.myapp.com")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowCredentials(true);
            }
        };
    }
}
```

### 3. 동적 CORS 설정
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // 환경에 따른 동적 설정
    if (isProduction()) {
        configuration.setAllowedOrigins(Arrays.asList("https://myapp.com"));
    } else {
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    }
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

## 실제 테스트 예시

### CORS 설정 전
```javascript
// 브라우저 콘솔에서 실행
fetch('http://localhost:8080/api/data')
  .then(response => {
    console.log('응답 받음:', response);
  })
  .catch(error => {
    console.error('CORS 에러:', error);
    // TypeError: Failed to fetch
    // Access to fetch at 'http://localhost:8080/api/data' from origin 'http://localhost:3000' 
    // has been blocked by CORS policy
  });
```

### CORS 설정 후
```javascript
// 브라우저 콘솔에서 실행
fetch('http://localhost:8080/api/data')
  .then(response => {
    console.log('응답 받음:', response);  // ✅ 정상 동작!
  })
  .then(data => {
    console.log('데이터:', data);
  });
```

## 핵심 정리

### CORS의 목적
- **브라우저의 보안 정책**: 악성 사이트의 다른 사이트 접근 차단
- **출처 검증**: 허용된 출처에서만 리소스 접근 허용
- **정상적인 통신 보장**: 개발자가 의도한 통신은 허용

### CORS 적용 조건
- ✅ **브라우저**에서 실행되는 JavaScript
- ✅ **다른 출처**로의 요청
- ✅ **웹 애플리케이션**에서 API 호출

### CORS 미적용 조건
- ❌ **서버 간** 통신
- ❌ **마이크로서비스** 간 통신
- ❌ **모바일 앱**에서 API 호출
- ❌ **Postman/curl** 등 도구 사용

### 결론
**CORS는 브라우저를 인터페이스로 사용하는 시스템에서 브라우저 → 백서버 통신 시 출처에 대한 보안을 보장하는 브라우저의 보안 메커니즘입니다.**
