const CommentsInThread = require('../CommentsInThread');

describe('CommentsInThread', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    const payload = {};

    // Action and Assert
    expect(() => new CommentsInThread(payload)).toThrowError('COMMENTS_IN_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data specification', async () => {
    // Arrange
    const payload = {
      comments: 'asdfg',
    };

    // Action & Assert
    expect(() => new CommentsInThread(payload)).toThrowError('COMMENTS_IN_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentsInThread object correctly', () => {
    // Arrange
    const comments = [
      {
        id: 'comment-123',
        username: 'user-123',
        content: 'comment a',
        date: '2020-01-01',
        isDeleted: false,
      },
      {
        id: 'comment-456',
        username: 'user-456',
        content: 'comment b',
        date: '2020-01-01',
        isDeleted: true,
      },
    ];

    // Action
    const result = new CommentsInThread({ comments }).comments;

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].content).toEqual(comments[0].content);
    expect(result[1].content).toEqual('**komentar telah dihapus**');
  });
});
