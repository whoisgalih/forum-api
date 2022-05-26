const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const { threadId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addedComment = await addCommentUseCase.execute({ threadId, content, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const getCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const comment = await getCommentUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: 'success',
      data: {
        comment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
