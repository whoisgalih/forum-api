// const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
// const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
// const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
// const PasswordHash = require('../../security/PasswordHash');
// const AddThreadUseCase = require('../AddThreadUseCase');

// describe('AddThreadUseCase', () => {
//   /**
//    * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
//    */
//   it('should orchestrating the add thread action correctly', async () => {
//     // Arrange
//     const useCasePayload = {
//       threadname: 'abc',
//       fullname: 'Dicoding Indonesia',
//     };

//     const expectedRegisteredThread = new RegisteredThread({
//       id: 'thread-123',
//       threadname: useCasePayload.threadname,
//       fullname: useCasePayload.fullname,
//     });

//     /** creating dependency of use case */
//     const mockThreadRepository = new ThreadRepository();

//     /** mocking needed function */
//     mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(expectedRegisteredThread));

//     /** creating use case instance */
//     const getThreadUseCase = new AddThreadUseCase({
//       threadRepository: mockThreadRepository,
//     });

//     // Action
//     const registeredThread = await getThreadUseCase.execute(useCasePayload);

//     // Assert
//     expect(registeredThread).toStrictEqual(expectedRegisteredThread);
//     expect(mockThreadRepository.addThread).toBeCalledWith(
//       new RegisterThread({
//         threadname: useCasePayload.threadname,
//         password: 'encrypted_password',
//         fullname: useCasePayload.fullname,
//       })
//     );
//   });
// });
