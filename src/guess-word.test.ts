import {guessWord} from "./puzzle/guess-word";


describe('Guess word', () => {
    const correctCharacterResult = 'IN_SOLUTION_SAME_POSITION'
    const wrongPositionResult = 'IN_SOLUTION_DIFF_POSITION'
    const notInSolutionResult = 'NOT_IN_SOLUTION'
    it('Gives all correct characters for a correct guess', async () => {
        expect(await guessWord({guess: 'abc', gameId: 'test', secretWord: jest.fn().mockResolvedValue('abc')}))
            .toEqual([correctCharacterResult, correctCharacterResult, correctCharacterResult])
    })
    it('handles different casing', async () => {
        expect(await guessWord({guess: 'ABC', gameId: 'test', secretWord: jest.fn().mockResolvedValue('abc')}))
            .toEqual([correctCharacterResult, correctCharacterResult, correctCharacterResult])
    })
    it('throws error if guess is empty', async () => {
        await expect(() => guessWord({guess: '', gameId: 'test', secretWord: jest.fn().mockResolvedValue('abc')})).rejects.toThrowError()
    })
    it('throws error if guess is different length', async () => {
        await expect(() => guessWord({guess: 'ab', gameId: 'test', secretWord: jest.fn().mockResolvedValue('abc')})).rejects.toThrowError()
        await expect(() => guessWord({guess: 'abcd', gameId: 'test', secretWord: jest.fn().mockResolvedValue('abc')})).rejects.toThrowError()
    })
    it('handles words with multiple of same character', async () => {
        expect(await guessWord({guess: 'aab', gameId: 'test', secretWord: jest.fn().mockResolvedValue('aba')}))
            .toEqual([correctCharacterResult, wrongPositionResult, wrongPositionResult])
    })
    it('handles guesses with incorrect character', async () => {
        expect(await guessWord({guess: 'aac', gameId: 'test', secretWord: jest.fn().mockResolvedValue('aba')}))
            .toEqual([correctCharacterResult, wrongPositionResult, notInSolutionResult])
    })
})
