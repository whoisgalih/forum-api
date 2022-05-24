const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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

    describe('getCommentById function', () => {
      it('should throw InvariantError when comment not found', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        return expect(commentRepositoryPostgres.getCommentById({ id: 'comment-123' })).rejects.toThrowError(NotFoundError);
      });

      it('should get detail comment', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
          username: 'unique_username',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const commentPayload = {
          id: 'comment-123',
          threadId: 'thread-123',
          content: 'a content',
          owner: userPayload.id,
        };

        await CommentsTableTestHelper.addComment(commentPayload);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const commentDetail = await commentRepositoryPostgres.getCommentById({ id: commentPayload.id });

        // Assert
        expect(commentDetail.id).toEqual(commentPayload.id);
        expect(commentDetail.threadId).toEqual(commentPayload.threadId);
        expect(commentDetail.content).toEqual(commentPayload.content);
        expect(commentDetail.owner).toEqual(userPayload.owner);
      });
    });
  });
});
