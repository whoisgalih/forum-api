const GetThread = require('../../Domains/threads/entities/GetThread');
const CommentsInThread = require('../../Domains/comments/entities/CommentsInThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { id } = new GetThread(useCasePayload);
    const threadDetail = await this._threadRepository.getThreadById({ id });
    const comments = await this._commentRepository.getCommentsByThreadId({ id });
    threadDetail.comments = new CommentsInThread({ comments }).comments;
    return threadDetail;
  }
}

module.exports = GetThreadUseCase;
