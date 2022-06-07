class CommentsInThread {
  constructor(payload) {
    this._verifyPayload(payload);
    const comments = this._mapComment(payload);
    this.comments = comments;
  }

  _verifyPayload({ comments }) {
    if (!comments) {
      throw new Error('COMMENTS_IN_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (!Array.isArray(comments)) {
      throw new Error('COMMENTS_IN_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _mapComment({ comments }) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.isDeleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }
}

module.exports = CommentsInThread;
