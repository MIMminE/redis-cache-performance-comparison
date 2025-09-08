# Spring 웹 프로젝트 구조와 프론트엔드 관리

## 핵심 질문: Spring 프로젝트에서 웹을 사용하면 프론트엔드가 자동으로 Spring에서 관리되는가?

**답변**: 아니요! **Spring 프로젝트에서 웹을 사용한다고 해서 프론트엔드가 자동으로 Spring에서 관리되는 것은 아닙니다.**

## Spring 웹 프로젝트의 구조 유형

### 1. 전통적인 Spring 웹 (Monolithic)

#### 프로젝트 구조
```
Spring Boot 프로젝트
├── src/main/java/          # 백엔드 코드
│   └── com/example/
│       └── controller/
│           └── WebController.java
├── src/main/resources/
│   ├── templates/          # Thymeleaf 템플릿
│   │   └── index.html
│   ├── static/            # 정적 파일 (CSS, JS, 이미지)
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── application.yml
└── src/main/webapp/       # JSP 파일 (선택사항)
    └── WEB-INF/
        └── views/
```

#### 특징
- ✅ 프론트엔드가 **같은 프로젝트 내부**에 있음
- ✅ **서버 사이드 렌더링** (SSR)
- ✅ **CORS 설정 불필요** (같은 도메인)
- ✅ Spring에서 **통합 관리**

#### 실제 코드 예시

**컨트롤러**:
```java
@Controller
public class WebController {
    
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("message", "Hello World");
        model.addAttribute("users", userService.getAllUsers());
        return "index";  // templates/index.html로 렌더링
    }
    
    @GetMapping("/api/data")
    @ResponseBody
    public ResponseEntity<List<User>> getData() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
```

**Thymeleaf 템플릿 (templates/index.html)**:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Home</title>
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
    <h1 th:text="${message}">Hello World</h1>
    
    <div th:each="user : ${users}">
        <p th:text="${user.name}">User Name</p>
    </div>
    
    <script th:src="@{/js/app.js}"></script>
    <script>
        // 같은 도메인이므로 CORS 불필요
        fetch('/api/data')
            .then(response => response.json())
            .then(data => console.log(data));
    </script>
</body>
</html>
```

**정적 파일 (static/css/style.css)**:
```css
body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1 {
    color: #333;
}
```

### 2. 현대적인 분리 구조 (Micro Frontend)

#### 프로젝트 구조
```
프론트엔드 프로젝트 (React/Vue/Angular)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── webpack.config.js

백엔드 프로젝트 (Spring Boot)
├── src/main/java/
│   └── com/example/
│       └── controller/
│           └── ApiController.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

#### 특징
- ✅ 프론트엔드가 **별도 프로젝트**
- ✅ **클라이언트 사이드 렌더링** (CSR)
- ✅ **CORS 설정 필요** (다른 도메인)
- ✅ **독립적인 개발/배포**

#### 실제 코드 예시

**백엔드 (Spring Boot)**:
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiController {
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
```

**프론트엔드 (React)**:
```javascript
// App.js
import React, { useState, useEffect } from 'react';

function App() {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        // 다른 도메인이므로 CORS 설정 필요
        fetch('http://localhost:8080/api/users')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error:', error));
    }, []);
    
    const addUser = (user) => {
        fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(newUser => setUsers([...users, newUser]));
    };
    
    return (
        <div>
            <h1>User Management</h1>
            {users.map(user => (
                <div key={user.id}>
                    <p>{user.name}</p>
                </div>
            ))}
        </div>
    );
}

export default App;
```

## CORS 설정의 필요성

### 전통적인 Spring 웹 (CORS 불필요)
```
사용자 → http://localhost:8080/ → Spring Controller → Thymeleaf 렌더링
```

**특징**:
- 같은 도메인에서 모든 요청 처리
- CORS 정책 적용되지 않음
- 서버 사이드에서 모든 렌더링

### 현대적인 분리 구조 (CORS 필요)
```
사용자 → http://localhost:3000 (React) → http://localhost:8080 (Spring API)
```

**특징**:
- 다른 도메인 간 통신
- CORS 정책 적용됨
- 클라이언트 사이드에서 렌더링

## Spring에서 프론트엔드 관리 방법

### 1. 정적 파일 서빙

#### 기본 설정
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // React 빌드 파일을 정적 리소스로 서빙
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
        
        // 특정 경로에 대한 정적 리소스 설정
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
    }
}
```

#### 디렉토리 구조
```
src/main/resources/
├── static/
│   ├── index.html          # React 빌드 결과물
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── assets/
└── application.yml
```

### 2. SPA 라우팅 지원

#### 설정
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 모든 경로를 index.html로 리다이렉트 (SPA 라우팅)
        registry.addViewController("/{spring:\\w+}")
                .setViewName("forward:/index.html");
        
        // 특정 경로들도 index.html로 리다이렉트
        registry.addViewController("/{spring:\\w+}/**/{spring:?!(\\.js|\\.css)$}")
                .setViewName("forward:/index.html");
    }
}
```

### 3. 빌드 통합 (Maven)

#### pom.xml 설정
```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.12.1</version>
    <configuration>
        <workingDirectory>frontend</workingDirectory>
    </configuration>
    <executions>
        <execution>
            <id>install node and npm</id>
            <goals>
                <goal>install-node-and-npm</goal>
            </goals>
            <configuration>
                <nodeVersion>v18.17.0</nodeVersion>
                <npmVersion>9.6.7</npmVersion>
            </configuration>
        </execution>
        <execution>
            <id>npm install</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <configuration>
                <arguments>install</arguments>
            </configuration>
        </execution>
        <execution>
            <id>npm run build</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```

#### 프로젝트 구조
```
Spring Boot 프로젝트
├── frontend/               # React 프로젝트
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── build/             # 빌드 결과물
├── src/main/java/
├── src/main/resources/
│   └── static/            # frontend/build 내용이 복사됨
└── pom.xml
```

### 4. 빌드 통합 (Gradle)

#### build.gradle 설정
```gradle
plugins {
    id 'com.github.node-gradle.node' version '3.5.1'
}

node {
    version = '18.17.0'
    npmVersion = '9.6.7'
    download = true
}

task buildFrontend(type: NpmTask) {
    workingDir = file('frontend')
    args = ['run', 'build']
}

task copyFrontend(type: Copy) {
    from 'frontend/build'
    into 'src/main/resources/static'
    dependsOn buildFrontend
}

processResources.dependsOn copyFrontend
```

## 현재 프로젝트의 구조 분석

### 현재 프로젝트는 분리 구조
```
프론트엔드 (React)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── services/
│   │   │   └── performanceService.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json

백엔드 (Spring Boot)
├── src/main/java/
│   └── com/example/rediscacheperformance/
│       ├── controller/
│       ├── service/
│       └── config/
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

### 특징
- ✅ **별도 프로젝트**로 분리
- ✅ **다른 포트**에서 실행 (3000 vs 8080)
- ✅ **CORS 설정 필요**
- ✅ **독립적인 개발/배포**

### 실행 방식
```bash
# 백엔드 실행
./mvnw spring-boot:run

# 프론트엔드 실행 (별도 터미널)
cd frontend
npm start
```

## 구조별 비교표

| 구분 | 전통적인 Spring 웹 | 현대적인 분리 구조 |
|------|-------------------|-------------------|
| **프론트엔드 위치** | 같은 프로젝트 내부 | 별도 프로젝트 |
| **렌더링 방식** | 서버 사이드 (SSR) | 클라이언트 사이드 (CSR) |
| **CORS 필요** | ❌ 불필요 | ✅ 필요 |
| **관리 방식** | Spring에서 통합 관리 | 독립적으로 관리 |
| **개발 효율성** | 백엔드 개발자 중심 | 프론트엔드/백엔드 분업 |
| **배포 방식** | 단일 배포 | 분리 배포 가능 |
| **확장성** | 제한적 | 높음 |
| **기술 스택** | Thymeleaf, JSP | React, Vue, Angular |

## 권장사항

### 1. 프로젝트 규모별 선택

#### 소규모 프로젝트
- **전통적인 Spring 웹** 권장
- 빠른 개발과 배포
- 단일 팀에서 관리

#### 중대규모 프로젝트
- **분리 구조** 권장
- 프론트엔드/백엔드 분업
- 독립적인 개발/배포

### 2. 기술 스택별 선택

#### Spring 중심 팀
- **전통적인 Spring 웹** + Thymeleaf
- 서버 사이드 렌더링
- SEO 중요 시

#### 현대적 웹 개발
- **분리 구조** + React/Vue/Angular
- 클라이언트 사이드 렌더링
- 사용자 경험 중요 시

## 요약

### 핵심 포인트
1. **Spring 프로젝트에서 웹을 사용한다고 해서 프론트엔드가 자동으로 Spring에서 관리되는 것은 아님**
2. **프로젝트 구조에 따라 관리 방식이 달라짐**
3. **전통적인 구조**: 같은 프로젝트 내부, CORS 불필요
4. **현대적인 구조**: 별도 프로젝트, CORS 필요

### 현재 프로젝트
- **분리 구조** 사용
- **CORS 설정 필요**
- **독립적인 개발/배포** 가능

**결론**: Spring 웹 프로젝트의 구조는 **개발팀의 요구사항과 기술 스택에 따라 선택**하며, **자동으로 결정되는 것이 아닙니다!**
