const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const user = {
        username: 'a_username',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: user.username,
          password: user.password,
          fullname: 'A Full Name',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: user,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread title',
          body: 'some body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment content',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const user = {
        username: 'a_username',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: user.username,
          password: user.password,
          fullname: 'A Full Name',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: user,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread title',
          body: 'some body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const user = {
        username: 'a_username',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: user.username,
          password: user.password,
          fullname: 'A Full Name',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: user,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread title',
          body: 'some body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: true,
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /comments/{commentId}', () => {
    it('should response 201 and response with correct value', async () => {
      // Arrange
      const user = {
        username: 'a_username',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: user.username,
          password: user.password,
          fullname: 'A Full Name',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: user,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread title',
          body: 'some body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment content',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseComment = JSON.parse(comment.payload);
      const commentId = responseComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const commentAfterDelete = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(commentAfterDelete[0].is_delete).toStrictEqual(true);
    });

    // it('should response 404 if comment not found', async () => {
    //   // Arrange
    //   const commentId = 'comment-123';
    //   const server = await createServer(container);

    //   // Action
    //   const response = await server.inject({
    //     method: 'GET',
    //     url: `/comments/${commentId}`,
    //   });

    //   // Assert
    //   const responseJson = JSON.parse(response.payload);
    //   expect(response.statusCode).toEqual(404);
    //   expect(responseJson.status).toEqual('fail');
    //   expect(responseJson.message).toEqual('comment tidak ditemukan');
    // });
  });
});
