const GetCommentsByThreadId = require('../GetCommentsByThreadId');

describe('a GetCommentsByThreadId entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new GetCommentsByThreadId(payload)).toThrowError('GET_COMMENT_BY_THREAD_ID.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: [],
    };

    expect(() => new GetCommentsByThreadId(payload)).toThrowError('GET_COMMENT_BY_THREAD_ID.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment object correctly', () => {
    const payload = {
      threadId: 'thread-123',
    };

    const comment = new GetCommentsByThreadId(payload);

    expect(comment.id).toEqual(payload.id);
  });
});
