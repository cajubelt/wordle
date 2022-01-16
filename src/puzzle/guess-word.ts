

/**
 * Get the secret word (the solution to the puzzle).
 *
 * Using a promise return type since the word should be set in some
 *  remotely configurable data store in the future.
 */
export async function getSecretWord(): Promise<string> {
    const secretWord = process.env.SECRET_WORD
    if (!secretWord){
        throw new Error('Missing required env var: SECRET_WORD')
    }
    return secretWord
}

enum CharacterGuessResult {
    NOT_IN_SOLUTION = 'NOT_IN_SOLUTION',  // black tile
    IN_SOLUTION_DIFF_POSITION = 'IN_SOLUTION_DIFF_POSITION',  // yellow tile
    IN_SOLUTION_SAME_POSITION = 'IN_SOLUTION_SAME_POSITION'  // green tile
}

/**
 * Guess the secret word.
 *
 * Returns a list of enum values indicating whether each character in
 *  the guess is correct, in the word but in a different position,
 *  or not in the secret word at all.
 *
 * @param guess
 * @param secretWord: getter for secret word, here for testing
 */
export async function guessWord(guess: string, secretWord: () => Promise<string> = getSecretWord): Promise<CharacterGuessResult[]> {
    const solution = (await secretWord()).toLowerCase()
    if (guess.length !== solution.length) {
        throw new Error(`Guess has incorrect length. Guess: ${guess}, solution: ${solution}`)
    }
    return guess
        .toLowerCase()
        .split('')
        .map((char: string, index: number) => {
        if (char === solution[index]) {
            return CharacterGuessResult.IN_SOLUTION_SAME_POSITION
        } else if (solution.includes(char)) {
            return CharacterGuessResult.IN_SOLUTION_DIFF_POSITION
        } else {
            return CharacterGuessResult.NOT_IN_SOLUTION
        }
    })
}
