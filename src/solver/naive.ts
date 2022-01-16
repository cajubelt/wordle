//@ts-ignore
import wordlist from 'wordlist-english'
import {CharacterGuessResult, getSecretWord, guessWord} from "../puzzle/guess-word"
import * as uuid from 'uuid'

const SECRET_WORD_LENGTH = 5  // todo eventually this should be in an API

const NUM_TRIES = 6  // todo this should also probly be from an API
const allWords: string[] = wordlist['english'].filter((word: string) => word.length === SECRET_WORD_LENGTH)

async function getNewGameId(): Promise<string> {
    // eventually this should query an API to start a new game
    return uuid.v4()
}

type SolveResult = CharacterGuessResult[][]
export async function solve(): Promise<SolveResult> {
    const gameId = await getNewGameId()
    console.debug(`secret word: ${await getSecretWord(gameId)}`)
    const results: SolveResult = []
    const guesses: string[] = []
    while (guesses.length < NUM_TRIES) {
        const guess = chooseNextGuess(results, guesses)
        const result = await guessWord({guess, gameId})
        guesses.push(guess)
        results.push(result)
        if (isSolvedResult(result)) {
            console.debug(`Solved after ${guesses.length} guesses: ${guesses}, results:\n${results.join('\n')}`)
            return results
        }
    }
    console.debug(`Failed to solve after ${guesses.length} guesses: ${guesses}, results:\n${results.join('\n')}`)
    return results
}

export function isSolvedResult(result?: CharacterGuessResult[]): boolean {
    if (!result) {
        return false
    } else if (result.length !== SECRET_WORD_LENGTH) {
        throw new Error('Result is different length than secret word length, should never happen')
    }
    return result.every((charResult) => charResult === CharacterGuessResult.IN_SOLUTION_SAME_POSITION)
}

export function chooseNextGuess(results: SolveResult, guesses: string[]): string {
    if (results.length !== guesses.length) {
        throw new Error(`Results and guesses lengths must be the same. Results: ${JSON.stringify(results)}, guesses: ${JSON.stringify(guesses)}`)
    }
    const correctChars: Record<number, string> = {}  // map index to character at correct position
    const includedChars: Record<number, string[]> = {}  // map index to character in the word, but not in that spot
    const excludedChars: string[] = []  // list of characters nowhere in secret word
    for (let idx = 0; idx < results.length; idx++) {
        const wordResult = results[idx]
        const guess = guesses[idx]
        guess
            .split('')
            .forEach((char: string, idx: number) => {
                const charResult = wordResult[idx]
                switch (charResult) {
                    case CharacterGuessResult.IN_SOLUTION_SAME_POSITION:
                        correctChars[idx] = char
                        break
                    case CharacterGuessResult.IN_SOLUTION_DIFF_POSITION:
                        // create or add to list
                        includedChars[idx] = [...(includedChars[idx] ?? []), char]
                        break
                    case CharacterGuessResult.NOT_IN_SOLUTION:
                        excludedChars.push(char)
                        break
                    default:
                        throw new Error(`Unexpected charResult: ${charResult} and idx ${idx}`)
                }
            })
    }
    const output = allWords.find((word: string) => {
        return word.length === SECRET_WORD_LENGTH &&
            !guesses.includes(word) &&
            !hasAnyOfCharacters(word, excludedChars) &&
            hasAllOfCharsInPosition(word, correctChars) &&
            hasNoneOfCharsAtPositions(word, includedChars) &&
            hasAllChars(word, Object.values(includedChars).flat())
    })
    if (!output) {
        console.error(`No word found.\n Results: ${results.join('\n')}\n\nGuesses: ${guesses}`)
        throw new Error(`No word found for results ${results}, guesses ${guesses}`)
    }
    return output
}

function hasAnyOfCharacters(word: string, chars: string[]): boolean {
    return word
        .split('')
        .reduce(
            (prev: boolean, cur: string) => prev || chars.includes(cur),
            false
        )
}

function hasAllOfCharsInPosition(word: string, posToChar: Record<number, string>): boolean {
    return Object.keys(posToChar).reduce((prev: boolean, cur: string) => {
        const curNum = parseInt(cur)
        return (prev && word[curNum] === posToChar[curNum])
    }, true)
}

/**
 * Verify that a word has none of certain characters in certain positions.
 *
 * For example, check that 'apple' doesn't have an 'e' or 'i' at index 0, or a 'z' at index 1.
 *
 * @param word: the word to check
 * @param posToChars: maps indices to illegal characters at that index
 */
function hasNoneOfCharsAtPositions(word: string, posToChars: Record<number, string[]>): boolean {
    return Object.keys(posToChars).reduce((prev: boolean, cur: string) => {
        const curNum = parseInt(cur)
        const chars = posToChars[curNum]
        return (prev && !chars.includes(word[curNum]))
    }, true)
}

/**
 * Verify that a word has all characters in a list
 *
 * @param word
 * @param chars
 */
function hasAllChars(word: string, chars: string[]): boolean {
    return chars.every(char => word.includes(char))
}
