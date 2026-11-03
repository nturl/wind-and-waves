// node --test scripts/  (Node 22.18+/23.6+ loads the .ts by stripping types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, checkChatBody, clientIp, rateLimited } from '../lib/aiGuard.ts';

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
