const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    const useCasePayload = {
      id: 'thread-123',
    };

    const expectedThread = {
      id: useCasePayload.id,
      title: 'some title',
      body: 'some body',
      date: new Date().toISOString(),
      username: 'whoisgalih',
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));

    const detailThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload);
    expect(detailThread).toStrictEqual(expectedThread);
  });
});
