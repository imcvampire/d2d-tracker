import { db } from './firebase'
import { doc, setDoc } from 'firebase/firestore'
import { v7 as uuidv7 } from 'uuid'
import * as Sentry from '@sentry/tanstackstart-react'

export interface CombatState {
    entities: Array<{
        id: string
        name: string
        health: number
        maxHealth: number
        initiative: number
        statuses: string[]
    }>
    currentTurnIndex: number
    currentRound: number
    dungeonMaster: string
    players: string[]
    createdAt: number
    updatedAt: number
}

/**
 * Creates a new combat session in Firebase
 * @param userEmail - The email of the user creating the combat (will be set as dungeonMaster)
 * @returns The ID of the created combat
 */
export async function createCombat(userEmail: string): Promise<string> {
    const combatId = uuidv7()

    const newState: CombatState = {
        entities: [],
        currentTurnIndex: 0,
        currentRound: 1,
        dungeonMaster: userEmail,
        players: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }

    await Sentry.startSpan({ name: 'Creating new combat session' }, async () => {
        const combatRef = doc(db, 'combats', combatId)
        await setDoc(combatRef, newState)
    })

    return combatId
}

