import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API 응답 에러:', error);
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태
      const message = error.response.data?.message || error.response.data?.error || '서버 오류가 발생했습니다';
      throw new Error(message);
    } else if (error.request) {
      // 요청을 보냈지만 응답을 받지 못함
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else {
      // 요청 설정 중 오류
      throw new Error('요청 처리 중 오류가 발생했습니다');
    }
  }
);

export const performanceService = {
  // 성능 테스트 실행
  async runPerformanceTest(testType) {
    try {
      const endpoint = testType === 'withCache' 
        ? '/api/performance/data/with-cache'
        : '/api/performance/data/without-cache';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('성능 테스트 실행 실패:', error);
      throw error;
    }
  },

  // 통계 조회
  async getStatistics() {
    try {
      const response = await api.get('/api/performance/statistics');
      return response.data;
    } catch (error) {
      console.error('통계 조회 실패:', error);
      throw error;
    }
  },

  // 캐시 클리어
  async clearCache() {
    try {
      const response = await api.post('/api/performance/cache/clear');
      return response.data;
    } catch (error) {
      console.error('캐시 클리어 실패:', error);
      throw error;
    }
  },

  // 데이터 조회 (캐시 사용)
  async getDataWithCache() {
    try {
      const response = await api.get('/api/data/all/with-cache');
      return response.data;
    } catch (error) {
      console.error('캐시 사용 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 데이터 조회 (캐시 미사용)
  async getDataWithoutCache() {
    try {
      const response = await api.get('/api/data/all/without-cache');
      return response.data;
    } catch (error) {
      console.error('캐시 미사용 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 카테고리별 데이터 조회 (캐시 사용)
  async getDataByCategoryWithCache(category) {
    try {
      const response = await api.get(`/api/data/category/${category}/with-cache`);
      return response.data;
    } catch (error) {
      console.error('카테고리별 캐시 사용 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 카테고리별 데이터 조회 (캐시 미사용)
  async getDataByCategoryWithoutCache(category) {
    try {
      const response = await api.get(`/api/data/category/${category}/without-cache`);
      return response.data;
    } catch (error) {
      console.error('카테고리별 캐시 미사용 데이터 조회 실패:', error);
      throw error;
    }
  },

  // ID별 데이터 조회 (캐시 사용)
  async getDataByIdWithCache(id) {
    try {
      const response = await api.get(`/api/data/${id}/with-cache`);
      return response.data;
    } catch (error) {
      console.error('ID별 캐시 사용 데이터 조회 실패:', error);
      throw error;
    }
  },

  // ID별 데이터 조회 (캐시 미사용)
  async getDataByIdWithoutCache(id) {
    try {
      const response = await api.get(`/api/data/${id}/without-cache`);
      return response.data;
    } catch (error) {
      console.error('ID별 캐시 미사용 데이터 조회 실패:', error);
      throw error;
    }
  }
};

export default performanceService;
