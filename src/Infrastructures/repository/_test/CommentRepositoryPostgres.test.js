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

    // describe('getCommentById function', () => {
    //   it('should throw InvariantError when comment not found', async () => {
    //     // Arrange
    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     return expect(commentRepositoryPostgres.getCommentById({ id: 'comment-123' })).rejects.toThrowError(NotFoundError);
    //   });

    //   it('should get detail comment', async () => {
    //     // Arrange
    //     const userPayload = {
    //       id: 'user-123',
    //       username: 'unique_username',
    //     };

    //     await UsersTableTestHelper.addUser(userPayload);

    //     const commentPayload = {
    //       id: 'comment-123',
    //       threadId: 'thread-123',
    //       content: 'a content',
    //       owner: userPayload.id,
    //     };

    //     await CommentsTableTestHelper.addComment(commentPayload);
    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action
    //     const commentDetail = await commentRepositoryPostgres.getCommentById({ id: commentPayload.id });

    //     // Assert
    //     expect(commentDetail.id).toEqual(commentPayload.id);
    //     expect(commentDetail.threadId).toEqual(commentPayload.threadId);
    //     expect(commentDetail.content).toEqual(commentPayload.content);
    //     expect(commentDetail.owner).toEqual(userPayload.owner);
    //   });
    // });

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
