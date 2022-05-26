const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = new DeleteComment(useCasePayload);
    await this._threadRepository.verifyThreadAvailability({ id: threadId });
    await this._commentRepository.verifyCommentOwner({ id: commentId, owner });
    await this._commentRepository.deleteComment({ id: commentId });
  }
}

module.exports = DeleteCommentUseCase;
