// 전역 변수
let testResults = [];
let statistics = null;

// DOM 요소들
const elements = {
    testWithoutCache: document.getElementById('testWithoutCache'),
    testWithCache: document.getElementById('testWithCache'),
    clearCache: document.getElementById('clearCache'),
    resultList: document.getElementById('resultList'),
    statsContent: document.getElementById('statsContent'),
    loading: document.getElementById('loading')
};

// API 호출 함수
async function apiCall(endpoint, method = 'GET') {
    const url = `http://localhost:8080${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
}

// 성능 테스트 실행
async function runTest(testType) {
    showLoading(true);
    
    try {
        const endpoint = testType === 'withCache' 
            ? '/api/performance/data/with-cache'
            : '/api/performance/data/without-cache';
        
        const result = await apiCall(endpoint);
        
        // 테스트 결과 저장
        const testResult = {
            ...result,
            timestamp: new Date(),
            testType: testType,
            cacheEnabled: testType === 'withCache'
        };
        
        testResults.push(testResult);
        updateResultList();
        showMessage(`${testType === 'withCache' ? '캐시 사용' : '캐시 미사용'} 테스트 완료!`, 'success');
        
        // 통계 새로고침
        await loadStatistics();
        
    } catch (error) {
        showMessage('테스트 실행 실패: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 캐시 클리어
async function clearCache() {
    try {
        await apiCall('/api/performance/cache/clear', 'POST');
        showMessage('캐시가 클리어되었습니다!', 'success');
        await loadStatistics();
    } catch (error) {
        showMessage('캐시 클리어 실패: ' + error.message, 'error');
    }
}

// 통계 로드
async function loadStatistics() {
    try {
        statistics = await apiCall('/api/performance/statistics');
        updateStatistics();
    } catch (error) {
        console.error('통계 로드 실패:', error);
        elements.statsContent.innerHTML = '<p style="color: red;">통계를 불러올 수 없습니다.</p>';
    }
}

// 결과 리스트 업데이트
function updateResultList() {
    const recentResults = testResults.slice(-10).reverse();
    
    if (recentResults.length === 0) {
        elements.resultList.innerHTML = '<p>테스트 결과가 없습니다.</p>';
        return;
    }
    
    const html = recentResults.map(result => `
        <div class="result-item ${result.cacheEnabled ? 'cache-enabled' : 'cache-disabled'}">
            <div class="result-info">
                <span>${result.cacheEnabled ? '⚡ 캐시 사용' : '🗄️ 캐시 미사용'}</span>
                <span>응답시간: ${result.responseTime}ms</span>
                <span>데이터 수: ${result.data?.length || 0}</span>
                ${result.cacheEnabled ? `<span class="cache-status ${result.cacheHit ? 'hit' : 'miss'}">${result.cacheHit ? '캐시 히트' : '캐시 미스'}</span>` : ''}
                <span style="font-size: 12px; color: #666;">${formatTime(result.timestamp)}</span>
            </div>
        </div>
    `).join('');
    
    elements.resultList.innerHTML = html;
}

// 통계 업데이트
function updateStatistics() {
    if (!statistics) return;
    
    const withCache = statistics.withCache || {};
    const withoutCache = statistics.withoutCache || {};
    
    const html = `
        <div class="stat-item">
            <div class="stat-value">${withCache.avgResponseTime || 0}</div>
            <div class="stat-label">캐시 사용 평균 응답시간 (ms)</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${withoutCache.avgResponseTime || 0}</div>
            <div class="stat-label">캐시 미사용 평균 응답시간 (ms)</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${withCache.cacheHitRate || 0}%</div>
            <div class="stat-label">캐시 적중률</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${(withCache.totalRequests || 0) + (withoutCache.totalRequests || 0)}</div>
            <div class="stat-label">총 요청 수</div>
        </div>
    `;
    
    elements.statsContent.innerHTML = html;
}

// 로딩 표시
function showLoading(show) {
    elements.loading.style.display = show ? 'block' : 'none';
}

// 메시지 표시
function showMessage(message, type) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 컨테이너에 추가
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// 시간 포맷팅
function formatTime(date) {
    return new Date(date).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    elements.testWithoutCache.addEventListener('click', () => runTest('withoutCache'));
    elements.testWithCache.addEventListener('click', () => runTest('withCache'));
    elements.clearCache.addEventListener('click', clearCache);
}

// 앱 초기화
function init() {
    console.log('Redis 캐시 성능 비교 앱 시작');
    setupEventListeners();
    loadStatistics();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
