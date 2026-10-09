import test from 'node:test';
import assert from 'node:assert/strict';
import {createSignupLimiter} from '../lib/signup-limit.ts';
test('testing several accounts on a shared IP never blocks a different email',()=>{const limiter=createSignupLimiter();for(let i=0;i<10;i++)limiter.check('shared-ip','master@example.com',0);assert.equal(limiter.check('shared-ip','penguin-klg@naver.com',0),0)});
test('repeat requests are bounded for one minute without extending the blocked window',()=>{const limiter=createSignupLimiter();for(let i=0;i<5;i++)assert.equal(limiter.check('ip','member@example.com',0),0);assert.equal(limiter.check('ip',' MEMBER@example.com ',1000),59);assert.equal(limiter.check('ip','member@example.com',59000),1);assert.equal(limiter.check('ip','member@example.com',60000),0)});
test('successful signup clears its retry counter and IPs have independent counters',()=>{const limiter=createSignupLimiter();for(let i=0;i<5;i++)limiter.check('ip','member@example.com',0);assert.equal(limiter.check('other-ip','member@example.com',1),0);limiter.clear('ip','member@example.com');assert.equal(limiter.check('ip','member@example.com',1),0)});
