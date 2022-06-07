const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    const useCasePayload = {
      id: 'thread-123',
    };

    const date = new Date().toISOString();

    const expectedThread = {
      id: useCasePayload.id,
      title: 'some title',
      body: 'some body',
      date,
      username: 'whoisgalih',
      comments: [
        {
          id: 'comment-123',
          content: 'a content',
          date,
          username: 'whoisgalih',
        },
        {
          id: 'comment-124',
          content: '**komentar telah dihapus**',
          date,
          username: 'whoisgalih',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: 'comment-123',
          content: 'a content',
          username: 'whoisgalih',
          date,
          isDeleted: false,
        },
        {
          id: 'comment-124',
          content: 'b content',
          username: 'whoisgalih',
          date,
          isDeleted: true,
        },
      ])
    );

    const detailThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith({ id: useCasePayload.id });
    expect(detailThread).toStrictEqual(expectedThread);
    expect(detailThread.comments).toHaveLength(2);
    expect(detailThread.comments[0].content).toBe('a content');
    expect(detailThread.comments[1].content).toBe('**komentar telah dihapus**');
  });
});
