const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: useCasePayload.id,
        body: 'hello title body',
        title: 'existing title',
        date: '2022-01-01T00:00:00.000Z',
        username: 'user123',
      })
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: 'comment-123',
          username: 'WFdvrs',
          date: '2022-01-01T00:00:00.000Z',
          content: 'rwgfiukwbfoi',
          isDeleted: false,
        },
        {
          id: 'comment-124',
          username: 'svbk',
          date: '2020-01-01T00:00:00.000Z',
          content: 'schkvludiewhoi',
          isDeleted: true,
        },
      ])
    );

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const existingThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);

    expect(existingThread).toEqual({
      id: useCasePayload.id,
      body: 'hello title body',
      title: 'existing title',
      date: '2022-01-01T00:00:00.000Z',
      username: 'user123',
      comments: [
        {
          id: 'comment-123',
          username: 'WFdvrs',
          date: '2022-01-01T00:00:00.000Z',
          content: 'rwgfiukwbfoi',
        },
        {
          id: 'comment-124',
          username: 'svbk',
          date: '2020-01-01T00:00:00.000Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });
  });
});
