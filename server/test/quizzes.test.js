/**
 * Tests d'INTÉGRATION de l'espace auteur : on démarre l'API sur une base
 * temporaire et on lui parle en HTTP, comme le fait le client.
 *
 * Le premier test est fourni. Les test.todo sont le jalon 2 ; le dernier
 * (« un questionnaire sans question ») est le jalon 3 : il doit ÉCHOUER
 * avant que vous corrigiez la route POST /api/games.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from './helpers.js';

let api;
before(async () => {
  api = await startServer();
});
after(() => api.close());

test('un titre vide est refusé (400)', async () => {
  const { status, data } = await api.request('POST', '/api/quizzes', { title: '   ' });
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});

test('un titre valide crée le questionnaire (201)', async () => {
  const { status, data } = await api.request('POST', '/api/quizzes', { title: 'Capitales' });
  assert.equal(status, 201);
  assert.equal(data.title, 'Capitales');
  assert.equal(typeof data.id, 'number');
});

// ── Jalon 2 ───────────────────────────────────────────────────────────────

test('une question sans bonne réponse est refusée (400)', async () => {
  const { data: quiz } = await api.request('POST', '/api/quizzes', { title: 'test' });
  const { status, data } = await api.request('POST', `/api/quizzes/${quiz.id}/questions`, {
    text: 'Quelle est la capitale de la France ?',
    durationSeconds: 20,
    choices: [
      { text: 'Lyon', isCorrect: false },
      { text: 'Marseille', isCorrect: false },
    ]
  });
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});

test('une question avec deux bonnes réponses est refusée (400)', async () => {
  const { data: quiz } = await api.request('POST', '/api/quizzes', { title: 'test2' });
  const { status, data } = await api.request('POST', `/api/quizzes/${quiz.id}/questions`, {
    text: 'Quelle est la capitale de la France ?',
    durationSeconds: 20,
    choices: [
      { text: 'Paris', isCorrect: true },
      { text: 'Lyon', isCorrect: true },
    ]
  });
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});

test('une question valide est ajoutée et apparaît dans GET /api/quizzes/:id', async () => {
  const { data: quiz } = await api.request('POST', '/api/quizzes', { title: 'test3' });
  const response = await api.request('POST', `/api/quizzes/${quiz.id}/questions`, {
    text: 'Quelle est la capitale de la France ?',
    durationSeconds: 20,
    choices: [
      { text: 'Paris', isCorrect: true },
      { text: 'Lyon', isCorrect: false },
    ]
  });
  
  console.log('Status:', response.status, 'Data:', response.data);
  assert.equal(response.status, 201);
  
});
// ── Jalon 3 : d'abord le test qui échoue, ensuite la correction ───────────

test('une partie sur un questionnaire sans question est refusée (400)', async () => {
  const { data: quiz } = await api.request('POST', '/api/quizzes', { title: 'vide' });
  const {status, data } = await api.request('POST', `/api/games`, { quizId: quiz.id });

  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});
