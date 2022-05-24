const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addedThread = await addThreadUseCase.execute({ title, body, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

    const { id } = request.params;

    const thread = await getThreadUseCase.execute({ id });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
