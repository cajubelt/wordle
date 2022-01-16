//@ts-ignore no types for this module...punting on that for now...
import wordlist from 'wordlist-english'

const SECRET_WORD_LENGTH = 5  // might want this to be configurable in the future...

const secretWordStore: Record<string, string> = {} // todo eventually need some kind of cache eviction here, this will grow with the number of games. separately, we probly shouldnt keep data in memory like this anyway.

async function chooseNewSecretWord(wordLength: number = SECRET_WORD_LENGTH): Promise<string> {
    const options: string[] = wordlist['english']
        .filter((word: string) => word.length === wordLength)
    console.log(`num options: ${options.length}`)
    return options[Math.floor(Math.random()*options.length)]
}

/**
 * Get the secret word (the solution to the puzzle).
 *
 * Using a promise return type since the word should be set in some
 *  remotely configurable data store in the future.
 */
export async function getSecretWord(gameId: string): Promise<string> {
    if (!secretWordStore[gameId]){
        secretWordStore[gameId] = await chooseNewSecretWord()
    }
    return secretWordStore[gameId]
}

export enum CharacterGuessResult {
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
 * @param gameId
 * @param secretWord: getter for secret word, here for testing
 */
export async function guessWord({guess, gameId, secretWord = getSecretWord}: {guess: string, gameId: string, secretWord?: (gameId: string) => Promise<string>}): Promise<CharacterGuessResult[]> {
    const solution = (await secretWord(gameId)).toLowerCase()
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
            // fixme if the guess already convers this char, should return a 'not in solution' response here. example: for guess 'manta' and solution 'bangs', the second 'a' should get 'not_in_solution'
            return CharacterGuessResult.IN_SOLUTION_DIFF_POSITION
        } else {
            return CharacterGuessResult.NOT_IN_SOLUTION
        }
    })
}
