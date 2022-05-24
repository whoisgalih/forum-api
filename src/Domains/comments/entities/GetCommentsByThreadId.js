class GetCommentsByThreadId {
  constructor(payload) {
    this._verifyPayload(payload);
    const { threadId } = payload;
    this.threadId = threadId;
  }

  _verifyPayload({ threadId }) {
    if (!threadId) {
      throw new Error('GET_COMMENT_BY_THREAD_ID.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_COMMENT_BY_THREAD_ID.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetCommentsByThreadId;
