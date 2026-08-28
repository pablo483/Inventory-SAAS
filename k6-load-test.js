import http from 'k6/http';
import { check, sleep } from 'k6';

// Load test configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '1m', target: 100 },  // Stay at 100 users
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
        http_req_failed: ['rate<0.01'],  // Error rate < 1%
    },
};

const BASE_URL = 'http://localhost:8080';

// Test data
let token = '';

export function setup() {
    // Login to get JWT token
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        email: 'admin@acme.com',
        password: 'AcmeAdmin@123'
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    const loginData = JSON.parse(loginRes.body);
    return { token: loginData.token };
}

//this fucntion runs in loop with the token data k6 automatically insert it 
export default function (data) {
    const headers = {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json',
    };

    // Test 1: Get products (read-heavy)
    const productRes = http.get(`${BASE_URL}/api/products?page=0&size=20`, { headers });
    check(productRes, {
        'products status 200': (r) => r.status === 200,
        'products response time OK': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // Test 2: Get categories
    const categoryRes = http.get(`${BASE_URL}/api/categories`, { headers });
    check(categoryRes, {
        'categories status 200': (r) => r.status === 200,
    });

    sleep(1);

    // Test 3: Low stock report
    const reportRes = http.get(`${BASE_URL}/api/reports/low-stock`, { headers });
    check(reportRes, {
        'report status 200': (r) => r.status === 200,
    });

    sleep(2);
}

//this dunction calls one time when the test is completed 
export function teardown(data) {
    console.log('Load test completed');
}