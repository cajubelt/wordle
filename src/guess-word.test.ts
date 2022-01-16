import {guessWord} from "./puzzle/guess-word";


describe('Guess word', () => {
    const correctCharacterResult = 'IN_SOLUTION_SAME_POSITION'
    const wrongPositionResult = 'IN_SOLUTION_DIFF_POSITION'
    const notInSolutionResult = 'NOT_IN_SOLUTION'
    it('Gives all correct characters for a correct guess', async () => {
        expect(await guessWord('abc', jest.fn().mockResolvedValue('abc')))
            .toEqual([correctCharacterResult, correctCharacterResult, correctCharacterResult])
    })
    it('handles different casing', async () => {
        expect(await guessWord('ABC', jest.fn().mockResolvedValue('abc')))
            .toEqual([correctCharacterResult, correctCharacterResult, correctCharacterResult])
    })
    it('throws error if guess is empty', async () => {
        await expect(() => guessWord('', jest.fn().mockResolvedValue('abc'))).rejects.toThrowError()
    })
    it('throws error if guess is different length', async () => {
        await expect(() => guessWord('ab', jest.fn().mockResolvedValue('abc'))).rejects.toThrowError()
        await expect(() => guessWord('abcd', jest.fn().mockResolvedValue('abc'))).rejects.toThrowError()
    })
    it('handles words with multiple of same character', async () => {
        expect(await guessWord('aab', jest.fn().mockResolvedValue('aba')))
            .toEqual([correctCharacterResult, wrongPositionResult, wrongPositionResult])
    })
    it('handles guesses with incorrect character', async () => {
        expect(await guessWord('aac', jest.fn().mockResolvedValue('aba')))
            .toEqual([correctCharacterResult, wrongPositionResult, notInSolutionResult])
    })
})
