// const pool = require('../../database/postgres/pool');
// const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
// // const ServerTestHelper = require('../../../../tests/ServerTestHelper');
// const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
// const container = require('../../container');
// const createServer = require('../createServer');

// describe('/comments endpoint', () => {
//   afterAll(async () => {
//     await pool.end();
//   });

//   afterEach(async () => {
//     await UsersTableTestHelper.cleanTable();
//     await CommentsTableTestHelper.cleanTable();
//   });

//   describe('when POST /comments', () => {
//     it('should response 201 and persisted comment', async () => {
//       // Arrange
//       const user = {
//         username: 'a_username',
//         password: 'secret',
//       };

//       const server = await createServer(container);

//       await server.inject({
//         method: 'POST',
//         url: '/users',
//         payload: {
//           username: user.username,
//           password: user.password,
//           fullname: 'A Full Name',
//         },
//       });

//       const authentication = await server.inject({
//         method: 'POST',
//         url: '/authentications',
//         payload: user,
//       });

//       const responseAuth = JSON.parse(authentication.payload);

//       // Action
//       const response = await server.inject({
//         method: 'POST',
//         url: '/comments',
//         payload: {
//           title: 'a comment title',
//           body: 'some body',
//         },
//         headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(201);
//       expect(responseJson.status).toEqual('success');
//       expect(responseJson.data.addedComment).toBeDefined();
//     });

//     it('should response 400 when request payload not contain needed property', async () => {
//       // Arrange
//       const user = {
//         username: 'a_username',
//         password: 'secret',
//       };

//       const server = await createServer(container);

//       await server.inject({
//         method: 'POST',
//         url: '/users',
//         payload: {
//           username: user.username,
//           password: user.password,
//           fullname: 'A Full Name',
//         },
//       });

//       const authentication = await server.inject({
//         method: 'POST',
//         url: '/authentications',
//         payload: user,
//       });

//       const responseAuth = JSON.parse(authentication.payload);

//       // Action
//       const response = await server.inject({
//         method: 'POST',
//         url: '/comments',
//         payload: {
//           title: 'a comment title',
//         },
//         headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(400);
//       expect(responseJson.status).toEqual('fail');
//       expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
//     });

//     it('should response 400 when request payload not meet data type specification', async () => {
//       // Arrange
//       const user = {
//         username: 'a_username',
//         password: 'secret',
//       };

//       const server = await createServer(container);

//       await server.inject({
//         method: 'POST',
//         url: '/users',
//         payload: {
//           username: user.username,
//           password: user.password,
//           fullname: 'A Full Name',
//         },
//       });

//       const authentication = await server.inject({
//         method: 'POST',
//         url: '/authentications',
//         payload: user,
//       });

//       const responseAuth = JSON.parse(authentication.payload);

//       // Action
//       const response = await server.inject({
//         method: 'POST',
//         url: '/comments',
//         payload: {
//           title: 'a comment title',
//           body: {},
//         },
//         headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(400);
//       expect(responseJson.status).toEqual('fail');
//       expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
//     });

//     it('should response 400 when title more than 150 character', async () => {
//       // Arrange
//       const user = {
//         username: 'a_username',
//         password: 'secret',
//       };

//       const server = await createServer(container);

//       await server.inject({
//         method: 'POST',
//         url: '/users',
//         payload: {
//           username: user.username,
//           password: user.password,
//           fullname: 'A Full Name',
//         },
//       });

//       const authentication = await server.inject({
//         method: 'POST',
//         url: '/authentications',
//         payload: user,
//       });

//       const responseAuth = JSON.parse(authentication.payload);

//       // Action
//       const response = await server.inject({
//         method: 'POST',
//         url: '/comments',
//         payload: {
//           title: 'a really really really really really really really really really really really really really really really really really really really really comment title',
//           body: 'some body',
//         },
//         headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(400);
//       expect(responseJson.status).toEqual('fail');
//       expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena karakter judul melebihi batas limit');
//     });
//   });

//   describe('when GET /comments/{commentId}', () => {
//     it('should response 201 and response with correct value', async () => {
//       // Arrange
//       const userPayload = {
//         id: 'user-123',
//         username: 'a_username',
//         password: 'secret',
//       };

//       const commentPayload = {
//         id: 'comment-123',
//         title: 'a comment title',
//         body: 'a comment body',
//         owner: userPayload.id,
//       };

//       await UsersTableTestHelper.addUser(userPayload);
//       await CommentsTableTestHelper.addComment(commentPayload);
//       const server = await createServer(container);

//       // Action
//       const response = await server.inject({
//         method: 'GET',
//         url: `/comments/${commentPayload.id}`,
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(201);
//       expect(responseJson.status).toEqual('success');
//       expect(responseJson.data.comment).toBeDefined();
//       // expect(responseJson.data.comment).toEqual('');
//       expect(responseJson.data.comment.id).toEqual(commentPayload.id);
//       expect(responseJson.data.comment.title).toEqual(commentPayload.title);
//       expect(responseJson.data.comment.body).toEqual(commentPayload.body);
//       expect(responseJson.data.comment.username).toEqual(userPayload.username);
//     });

//     it('should response 404 if comment not found', async () => {
//       // Arrange
//       const commentId = 'comment-123';
//       const server = await createServer(container);

//       // Action
//       const response = await server.inject({
//         method: 'GET',
//         url: `/comments/${commentId}`,
//       });

//       // Assert
//       const responseJson = JSON.parse(response.payload);
//       expect(response.statusCode).toEqual(404);
//       expect(responseJson.status).toEqual('fail');
//       expect(responseJson.message).toEqual('comment tidak ditemukan');
//     });
//   });
// });
