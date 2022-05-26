const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'a comment',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(expectedAddedComment));

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const addedComment = await getCommentUseCase.execute(useCasePayload);

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment(useCasePayload));
  });
});