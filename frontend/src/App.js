import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Statistic, message, Spin, Tag } from 'antd';
import { 
  ThunderboltOutlined, 
  DatabaseOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';
import { performanceService } from './services/performanceService';

function App() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await performanceService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const runTest = async (testType) => {
    setLoading(true);
    setCurrentTest(testType);
    
    try {
      const result = await performanceService.runPerformanceTest(testType);
      setTestResults(prev => [...prev, { ...result, timestamp: new Date() }]);
      message.success(`${testType === 'withCache' ? '캐시 사용' : '캐시 미사용'} 테스트 완료`);
      loadStatistics(); // 통계 새로고침
    } catch (error) {
      message.error('테스트 실행 실패: ' + error.message);
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  const clearCache = async () => {
    try {
      await performanceService.clearCache();
      message.success('캐시가 클리어되었습니다');
      loadStatistics();
    } catch (error) {
      message.error('캐시 클리어 실패: ' + error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    message.info('테스트 결과가 클리어되었습니다');
  };

  const formatResponseTime = (time) => {
    return `${time}ms`;
  };

  const getCacheStatusTag = (cacheHit) => {
    return cacheHit ? 
      <Tag color="green">캐시 히트</Tag> : 
      <Tag color="orange">캐시 미스</Tag>;
  };

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h1><ThunderboltOutlined /> Redis 캐시 성능 비교 대시보드</h1>
        <p>API 응답 속도 향상 효과를 실시간으로 측정하고 비교합니다</p>
      </div>

      {/* 테스트 컨트롤 */}
      <Card className="test-controls" title="성능 테스트 컨트롤">
        <div className="control-buttons">
          <Button
            type="primary"
            size="large"
            icon={<DatabaseOutlined />}
            loading={loading && currentTest === 'withoutCache'}
            onClick={() => runTest('withoutCache')}
            disabled={loading}
          >
            캐시 미사용 테스트
          </Button>
          
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            loading={loading && currentTest === 'withCache'}
            onClick={() => runTest('withCache')}
            disabled={loading}
          >
            캐시 사용 테스트
          </Button>
          
          <Button
            size="large"
            icon={<ClearOutlined />}
            onClick={clearCache}
            disabled={loading}
          >
            캐시 클리어
          </Button>
          
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={clearResults}
            disabled={loading}
          >
            결과 클리어
          </Button>
        </div>
      </Card>

      {/* 통계 카드 */}
      {statistics && (
        <Row gutter={[16, 16]} className="metrics-grid">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="캐시 사용 평균 응답시간"
                value={statistics.withCache?.avgResponseTime || 0}
                suffix="ms"
                valueStyle={{ color: '#3f8600' }}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="캐시 미사용 평균 응답시간"
                value={statistics.withoutCache?.avgResponseTime || 0}
                suffix="ms"
                valueStyle={{ color: '#cf1322' }}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="캐시 적중률"
                value={statistics.withCache?.cacheHitRate || 0}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 요청 수"
                value={(statistics.withCache?.totalRequests || 0) + (statistics.withoutCache?.totalRequests || 0)}
                valueStyle={{ color: '#722ed1' }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 실시간 테스트 결과 */}
      {testResults.length > 0 && (
        <Card title="실시간 테스트 결과" className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={testResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis label={{ value: '응답시간 (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleString()}
                formatter={(value, name) => [formatResponseTime(value), name === 'withCache' ? '캐시 사용' : '캐시 미사용']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#1890ff" 
                strokeWidth={2}
                name="withCache"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 성능 비교 차트 */}
      {statistics && (statistics.withCache?.avgResponseTime || statistics.withoutCache?.avgResponseTime) && (
        <Card title="성능 비교" className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              {
                name: '캐시 미사용',
                응답시간: statistics.withoutCache?.avgResponseTime || 0,
                요청수: statistics.withoutCache?.totalRequests || 0
              },
              {
                name: '캐시 사용',
                응답시간: statistics.withCache?.avgResponseTime || 0,
                요청수: statistics.withCache?.totalRequests || 0,
                캐시적중률: statistics.withCache?.cacheHitRate || 0
              }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: '응답시간 (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [name === '캐시적중률' ? `${value}%` : `${value}ms`, name]} />
              <Legend />
              <Bar dataKey="응답시간" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 최근 테스트 결과 테이블 */}
      {testResults.length > 0 && (
        <Card title="최근 테스트 결과" className="chart-container">
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {testResults.slice(-10).reverse().map((result, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: 8 }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {result.cacheEnabled ? '캐시 사용' : '캐시 미사용'} 테스트
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="stat-item">
                      <div className="stat-value">{formatResponseTime(result.responseTime)}</div>
                      <div className="stat-label">응답시간</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="stat-item">
                      <div className="stat-value">
                        {result.cacheEnabled ? getCacheStatusTag(result.cacheHit) : '-'}
                      </div>
                      <div className="stat-label">캐시 상태</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="stat-item">
                      <div className="stat-value">{result.data?.length || 0}</div>
                      <div className="stat-label">데이터 수</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default App;
