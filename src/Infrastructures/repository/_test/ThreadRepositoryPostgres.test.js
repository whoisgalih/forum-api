const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {}); // Dummy dependency

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should persist add thread and return added thread correctly', async () => {
        // Arrange
        const userPayload = {
          id: 'user-123',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          title: 'some thread',
          body: 'some body',
          owner: userPayload.id,
        };

        const addThread = new AddThread(threadPayload);

        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedThread = await threadRepositoryPostgres.addThread(addThread);

        // Assert
        const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
        expect(thread).toHaveLength(1);
        expect(addedThread).toStrictEqual(
          new AddedThread({
            id: 'thread-123',
            title: threadPayload.title,
            body: threadPayload.body,
            owner: userPayload.id,
          })
        );
      });
    });

    describe('getThreadById function', () => {
      it('should throw InvariantError when thread not found', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        return expect(threadRepositoryPostgres.getThreadById({ id: 'thread-123' })).rejects.toThrowError(NotFoundError);
      });

      it('should get detail thread', async () => {
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
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const threadDetail = await threadRepositoryPostgres.getThreadById({ id: threadPayload.id });

        // Assert
        expect(threadDetail.id).toEqual(threadPayload.id);
        expect(threadDetail.title).toEqual(threadPayload.title);
        expect(threadDetail.body).toEqual(threadPayload.body);
        expect(threadDetail.username).toEqual(userPayload.username);
      });
    });
  });
});
