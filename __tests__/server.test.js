'use strict';

const server = require('../src/server.js');
const supertest = require('supertest');
// const request = supertest(server.app);

const mockRequest = supertest(server.app);


/*
AUTH Routes
POST /signup creates a new user and sends an object with the user and the token to the client
POST /signin with basic authentication headers logs in a user and sends an object with the user and the token to the client
V1 (Unauthenticated API) routes
POST /api/v1/:model adds an item to the DB and returns an object with the added item
GET /api/v1/:model returns a list of :model items
GET /api/v1/:model/ID returns a single item by ID
PUT /api/v1/:model/ID returns a single, updated item by ID
DELETE /api/v1/:model/ID returns an empty object. Subsequent GET for the same ID should result in nothing found
V2 (Authenticated API Routes)
POST /api/v2/:model with a bearer token that has create permissions adds an item to the DB and returns an object with the added item
GET /api/v2/:model with a bearer token that has read permissions returns a list of :model items
GET /api/v2/:model/ID with a bearer token that has read permissions returns a single item by ID
PUT /api/v2/:model/ID with a bearer token that has update permissions returns a single, updated item by ID
DELETE /api/v2/:model/ID with a bearer token that has delete permissions returns an empty object. Subsequent GET for the same ID should result in nothing found
*/


let users = {
    admin: { username: 'admin', password: 'password' },
    editor: { username: 'editor', password: 'password' },
    writer: { username: 'writer', password: 'password' },
    user: { username: 'user', password: 'password' },
  };
  

// POST /signup creates a new user and sends an object with the user and the token to the client
describe('Auth Router', () => {

    Object.keys(users).forEach(userType => {
  
      describe(`${userType} users`, () => {
  
        it('can create one', async (done) => {
  
          const response = await mockRequest.post('/signup').send(users[userType]);
          const userObject = response.body;
  
          expect(response.status).toBe(201);
          expect(userObject.token).toBeDefined();
          expect(userObject.user.id).toBeDefined();
          expect(userObject.user.username).toEqual(users[userType].username)
          done();
        });
  
        it('can signin with basic', async (done) => {
  
          const response = await mockRequest.post('/signin')
            .auth(users[userType].username, users[userType].password);
  
          const userObject = response.body;
          expect(response.status).toBe(200);
          expect(userObject.token).toBeDefined();
          expect(userObject.user.id).toBeDefined();
          expect(userObject.user.username).toEqual(users[userType].username)
          done();
        });
  
        it('can signin with bearer', async (done) => {
  
          // First, use basic to login to get a token
          const response = await mockRequest.post('/signin')
            .auth(users[userType].username, users[userType].password);
  
          const token = response.body.token;
  
          // First, use basic to login to get a token
          const bearerResponse = await mockRequest
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
  
          // Not checking the value of the response, only that we "got in"
          expect(bearerResponse.status).toBe(200);
          done();
        });
  
      });
  
      describe('bad logins', () => {
        it('basic fails with known user and wrong password ', async (done) => {
  
          const response = await mockRequest.post('/signin')
            .auth('admin', 'xyz')
          const userObject = response.body;
  
          expect(response.status).toBe(403);
          expect(userObject.user).not.toBeDefined();
          expect(userObject.token).not.toBeDefined();
          done();
        });
  
        it('basic fails with unknown user', async (done) => {
  
          const response = await mockRequest.post('/signin')
            .auth('nobody', 'xyz')
          const userObject = response.body;
  
          expect(response.status).toBe(403);
          expect(userObject.user).not.toBeDefined();
          expect(userObject.token).not.toBeDefined()
          done();
        });
  
        it('bearer fails with an invalid token', async (done) => {
  
          // First, use basic to login to get a token
          const bearerResponse = await mockRequest
            .get('/users')
            .set('Authorization', `Bearer foobar`)
  
          // Not checking the value of the response, only that we "got in"
          expect(bearerResponse.status).toBe(403);
          done();
        })
      })
  
    });
  
  });