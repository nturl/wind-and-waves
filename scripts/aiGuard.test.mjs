// node --test scripts/  (Node 22.18+/23.6+ loads the .ts by stripping types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, checkChatBody, clientIp, clipChat, num, rateLimited, trimSpots } from '../lib/aiGuard.ts';

const msg = (content, role = 'user') => ({ role, content });

test('a normal chat body passes', () => {
  assert.equal(checkChatBody([msg('wind at Topsail?')], new Array(40).fill({})), null);
});

test('chat caps message count, length, role and spots', () => {
  assert.equal(checkChatBody([], []), 'messages required');
  assert.equal(checkChatBody(new Array(LIMITS.chatMessages + 1).fill(msg('hi')), []), 'too many messages');
  assert.equal(checkChatBody([msg('x'.repeat(LIMITS.messageChars + 1))], []), 'message too long');
  assert.equal(checkChatBody([msg('hi', 'system')], []), 'bad message role');
  assert.equal(checkChatBody([{ role: 'user', content: { text: 'hi' } }], []), 'message too long');
  assert.equal(checkChatBody([msg('hi')], new Array(LIMITS.spots + 1).fill({})), 'too many spots');
});

test('rate limit allows the window budget, then blocks, then recovers', () => {
  const t0 = 1_000_000;
  for (let i = 0; i < LIMITS.requestsPerWindow; i++) assert.equal(rateLimited('1.2.3.4', t0 + i), false);
  assert.equal(rateLimited('1.2.3.4', t0 + 100), true);
  assert.equal(rateLimited('5.6.7.8', t0 + 100), false, 'other IPs unaffected');
  assert.equal(rateLimited('1.2.3.4', t0 + LIMITS.windowMs + 50), false, 'window slides');
});

test('client IP comes from the first x-forwarded-for hop', () => {
  const h = (o) => ({ get: (k) => o[k] ?? null });
  assert.equal(clientIp(h({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' })), '9.9.9.9');
  assert.equal(clientIp(h({ 'x-real-ip': '8.8.8.8' })), '8.8.8.8');
  assert.equal(clientIp(h({})), 'unknown');
});

test('spots keep only prompt fields, strings clipped, numbers coerced', () => {
  const big = 'x'.repeat(100_000);
  const [s] = trimSpots([{ id: 'topsail', name: big, region: 'NC', type: 'kite', lat: 1, extra: big,
    wind: { avg: '12', gust: big, directionText: 'NE', timestamp: big } }]);
  assert.equal(s.name.length, LIMITS.spotNameChars);
  assert.deepEqual(s.wind, { avg: 12, gust: null, directionText: 'NE' });
  assert.equal(JSON.stringify(s).length < 500, true);
  assert.deepEqual(trimSpots([{ id: 'a', wind: null }])[0].wind, null);
  assert.deepEqual(trimSpots(undefined), []);
});

test('long Gemini replies in history are clipped, long user messages still rejected', () => {
  const hist = [msg('q1'), msg('y'.repeat(5000), 'model'), msg('q2')];
  const clipped = clipChat(hist);
  assert.equal(clipped[1].content.length, LIMITS.messageChars);
  assert.equal(checkChatBody(clipped, []), null);
  assert.equal(checkChatBody(clipChat([msg('z'.repeat(5000))]), []), 'message too long');
  assert.equal(clipChat(new Array(40).fill(msg('hi'))).length, LIMITS.chatMessages);
});

test('num accepts finite numbers only', () => {
  assert.equal(num(180), 180);
  assert.equal(num('75'), 75);
  assert.equal(num(0), 0);
  assert.equal(num(null), null);
  assert.equal(num('x'.repeat(10)), null);
  assert.equal(num({}), null);
});
