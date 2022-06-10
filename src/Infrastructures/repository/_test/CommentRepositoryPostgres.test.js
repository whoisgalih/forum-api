const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // Dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist add comment and return added comment correctly', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: userPayload.id,
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const commentPayload = {
          threadId: 'thread-123',
          content: 'a content',
          owner: userPayload.id,
        };

        const addComment = new AddComment(commentPayload);

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(addComment);

        // Assert
        const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
        expect(comment).toHaveLength(1);
        expect(addedComment).toStrictEqual(
          new AddedComment({
            id: 'comment-123',
            content: 'a content',
            owner: userPayload.id,
          })
        );
      });
    });

    describe('verifyIfCommentExists function', () => {
      it('should throw error if comment not exist', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: userPayload.id,
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyIfCommentExists({ id: 'comment-123' })).rejects.toThrow(NotFoundError);
      });

      it('should not throw error if comment exist', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: userPayload.id,
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const commentPayload = {
          threadId: 'thread-123',
          content: 'a content',
          owner: userPayload.id,
        };

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        const addedComment = await commentRepositoryPostgres.addComment(new AddComment(commentPayload));

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyIfCommentExists({ id: addedComment.id })).resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyCommentOwner function', () => {
      it('should throw AuthorizationError if comment not belong to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        const user1 = {
          id: 'user-123',
          username: 'a_username',
          password: 'a_password',
        };

        const user2 = {
          id: 'user-456',
          username: 'b_username',
          password: 'b_password',
        };

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: user1.id,
        };

        await UsersTableTestHelper.addUser(user1);
        await UsersTableTestHelper.addUser(user2);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'a content',
          thread: 'thread-123',
          owner: 'user-123',
        });

        const falseOwner = {
          id: 'comment-123',
          owner: 'user-456',
        };

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOwner(falseOwner)).rejects.toThrow(AuthorizationError);
      });

      it('should not do anything if comment belong to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        const user1 = {
          id: 'user-123',
          username: 'a_username',
          password: 'a_password',
        };

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: user1.id,
        };

        await UsersTableTestHelper.addUser(user1);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'a content',
          thread: 'thread-123',
          owner: 'user-123',
        });

        const trueOwner = {
          id: 'comment-123',
          owner: 'user-123',
        };

        const spy = jest.spyOn(commentRepositoryPostgres, 'verifyCommentOwner');
        commentRepositoryPostgres.verifyCommentOwner(trueOwner);

        // Action & Assert
        expect(spy).toBeCalledWith(trueOwner);
      });
    });

    describe('getCommentByThreadId function', () => {
      it('should get all comment in specified thread', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
          username: 'unique_username',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: userPayload.id,
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const commentPayload = {
          id: 'comment-123',
          threadId: threadPayload.id,
          content: 'a content',
          owner: userPayload.id,
          isDeleted: false,
        };

        const commentPayload2 = {
          id: 'comment-124',
          threadId: threadPayload.id,
          content: 'a content',
          owner: userPayload.id,
          isDeleted: true,
        };

        await CommentsTableTestHelper.addComment(commentPayload);
        await CommentsTableTestHelper.addComment(commentPayload2);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const comments = await commentRepositoryPostgres.getCommentsByThreadId({ id: threadPayload.id });

        // Assert
        expect(comments).toHaveLength(2);
        // expect(comments).toStrictEqual('');
        expect(comments[0].id).toStrictEqual(commentPayload.id);
        expect(comments[0].content).toStrictEqual(commentPayload.content);
        expect(comments[0].username).toStrictEqual(userPayload.username);
        expect(comments[0].isDeleted).toStrictEqual(false);
        expect(comments[1].id).toStrictEqual(commentPayload2.id);
        expect(comments[1].username).toStrictEqual(userPayload.username);
        expect(comments[1].content).toStrictEqual(commentPayload2.content);
        expect(comments[1].isDeleted).toStrictEqual(commentPayload2.isDeleted);
      });
    });

    describe('deleteComment function', () => {
      it('should throw InvariantError when comment not found', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        return expect(commentRepositoryPostgres.deleteComment({ id: 'comment-123' })).rejects.toThrowError(NotFoundError);
      });

      it('should delete comment', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
          username: 'unique_username',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'some title',
          body: 'some thread',
          owner: userPayload.id,
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const commentPayload = {
          id: 'comment-123',
          threadId: 'thread-123',
          content: 'a content',
          owner: userPayload.id,
        };

        await CommentsTableTestHelper.addComment(commentPayload);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        await commentRepositoryPostgres.deleteComment({ id: commentPayload.id });
        const comments = await CommentsTableTestHelper.findCommentsById({ id: commentPayload.id });

        // Assert
        expect(comments).toHaveLength(0);
      });
    });
  });
});
