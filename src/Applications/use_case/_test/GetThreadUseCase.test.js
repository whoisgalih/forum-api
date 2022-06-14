const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123',
    };

    const threadFromDatabase = {
      id: useCasePayload.id,
      body: 'hello title body',
      title: 'existing title',
      date: new Date().toISOString(),
      username: 'user123',
    };

    const commentsFromDatabase = [
      {
        id: 'comment-123',
        username: 'WFdvrs',
        date: new Date(),
        content: 'rwgfiukwbfoi',
        isDeleted: false,
      },
      {
        id: 'comment-124',
        username: 'svbk',
        date: new Date(),
        content: 'schkvludiewhoi',
        isDeleted: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(threadFromDatabase));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(commentsFromDatabase));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const existingThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    // make sure function called
    expect(existingThread).toStrictEqual(threadFromDatabase);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
  });
});
