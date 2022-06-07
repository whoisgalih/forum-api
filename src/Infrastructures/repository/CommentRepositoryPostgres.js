const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { threadId, content, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, createdAt, false],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyIfCommentExists({ id }) {
    const query = {
      text: `SELECT * FROM Comments WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner({ id, owner }) {
    const query = {
      text: `SELECT * FROM comments
      WHERE is_delete = false AND id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    const { owner: commentOwner } = result.rows[0];

    if (commentOwner !== owner) {
      throw new AuthorizationError('anda tidak memiliki akses unutk resource ini');
    }
  }

  async getCommentsByThreadId({ id }) {
    const query = {
      text: `SELECT comments.id, users.username, comments.content, comments.created_at AS date,  comments.is_delete
      FROM comments
      LEFT JOIN users ON users.id = comments.owner
      WHERE comments.thread_id = $1
      ORDER BY comments.created_at`,
      values: [id],
    };

    const result = await this._pool.query(query);

    const rows = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      content: row.content,
      date: row.date,
      isDeleted: row.is_delete,
    }));

    return rows;
  }

  async deleteComment({ id }) {
    const query = {
      text: `UPDATE Comments
      SET is_delete = true
      WHERE is_delete = false AND id = $1 `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
