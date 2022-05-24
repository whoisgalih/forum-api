const GetThread = require('../../Domains/threads/entities/GetThread');
// const ThreadComment = require('../../Domains/comments/entities/ThreadComment');

class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const thread = new GetThread(useCasePayload);
    const threadDetail = await this._threadRepository.getThreadById(thread);
    // const getCommentsThread = await this._commentRepository.getCommentsThread(thread);
    // threadDetail.comments = new ThreadComment({ comments: getCommentsThread }).comments;
    return threadDetail;
  }
}

module.exports = GetThreadUseCase;
