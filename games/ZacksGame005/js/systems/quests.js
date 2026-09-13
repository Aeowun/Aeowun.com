import { gameState } from '../state/gameState.js';

/*
 * Simple quest state for the Village Elder quest.
 *
 * Public API:
 *
 *     initQuests()
 *     updateQuestProgress('FIND', {
 *         objectId: 'old_sword'
 *     });
 *
 *     updateQuestProgress('TALK', {
 *         npcName: 'Village Elder'
 *     });
 */

const QUEST_STAGES = [
    {
        id: 'not_started',
        type: 'talk',
        npcName: 'Village Elder',
        targetX: 78.5,
        targetY: 79.5,
        world: 'overworld'
    },

    {
        id: 'sword',
        type: 'find',
        objectId: 'old_sword',
        targetX: 82.2,
        targetY: 74.5,
        world: 'overworld'
    },

    {
        id: 'hunt',
        type: 'kill',
        target: 'creature',
        goal: 1,
        targetX: 65.5,
        targetY: 62.5,
        world: 'overworld'
    },

    {
        id: 'return',
        type: 'talk',
        npcName: 'Village Elder',
        targetX: 78.5,
        targetY: 79.5,
        world: 'overworld'
    },

    {
        id: 'dungeon_intro',
        type: 'explore',
        target: 'cave',
        targetX: 67,
        targetY: 49,
        world: 'overworld'
    },

    {
        id: 'dungeon_boss',
        type: 'kill',
        target: 'boss',
        targetX: 61,
        targetY: 36,
        world: 'dungeon'
    },

    {
        id: 'complete',
        type: 'complete'
    }
];

function createQuestState() {
    return {
        state: 'not_started',
        progress: 0,
        rewardClaimed: false,
        completedObjectives: []
    };
}

function ensureQuestState() {
    if (
        !gameState.quest ||
        typeof gameState.quest !== 'object'
    ) {
        gameState.quest =
            createQuestState();
    }

    const quest =
        gameState.quest;

    if (
        typeof quest.state !== 'string'
    ) {
        quest.state = 'not_started';
    }

    if (
        !Number.isFinite(
            quest.progress
        )
    ) {
        quest.progress = 0;
    }

    if (
        !Array.isArray(
            quest.completedObjectives
        )
    ) {
        quest.completedObjectives = [];
    }

    if (
        typeof quest.rewardClaimed !== 'boolean'
    ) {
        quest.rewardClaimed = false;
    }

    return quest;
}

/*
 * Called during game startup.
 *
 * IMPORTANT:
 * This does not erase an existing quest.
 * It only guarantees that a valid quest state exists.
 */
export function initQuests() {
    return ensureQuestState();
}

function getStage(state) {
    return (
        QUEST_STAGES.find(
            stage =>
                stage.id === state
        ) ||
        QUEST_STAGES[0]
    );
}

function markObjectiveComplete(
    quest,
    key
) {
    if (
        !Array.isArray(
            quest.completedObjectives
        )
    ) {
        quest.completedObjectives = [];
    }

    if (
        !quest.completedObjectives.includes(
            key
        )
    ) {
        quest.completedObjectives.push(
            key
        );
    }
}

export function updateQuestProgress(
    type,
    data
) {
    const quest =
        ensureQuestState();

    const eventType =
        String(
            type || ''
        ).toUpperCase();

    const eventData =
        data &&
        typeof data === 'object'
            ? data
            : {};

    const stage =
        getStage(
            quest.state
        );

    /*
     * FIND OLD SWORD
     */
    if (
        eventType === 'FIND' &&
        stage.id === 'sword'
    ) {
        if (
            eventData.objectId !==
            'old_sword'
        ) {
            return false;
        }

        quest.progress = 1;

        markObjectiveComplete(
            quest,
            'old_sword'
        );

        quest.state =
            'hunt';

        return true;
    }

    /*
     * KILL CREATURE
     */
    if (
        eventType === 'KILL' &&
        stage.id === 'hunt'
    ) {
        if (
            eventData.target &&
            eventData.target !== 'creature'
        ) {
            return false;
        }

        const amount =
            Number(
                eventData.amount
            ) || 1;

        quest.progress =
            Math.min(
                1,
                Math.max(
                    0,
                    quest.progress +
                        amount
                )
            );

        if (
            quest.progress >= 1
        ) {
            quest.state =
                'return';
        }

        return true;
    }

    /*
     * TALK TO VILLAGE ELDER
     *
     * interaction.js owns the final
     * dialogue/reward transition.
     */
    if (
        eventType === 'TALK' &&
        stage.id === 'return'
    ) {
        if (
            eventData.npcName !==
            'Village Elder'
        ) {
            return false;
        }

        markObjectiveComplete(
            quest,
            'Village Elder'
        );

        quest.state = 'dungeon_intro';
        return true;
    }

    /*
     * ENTER DUNGEON
     */
    if (
        eventType === 'EXPLORE' &&
        stage.id === 'dungeon_intro'
    ) {
        if (eventData.target === 'cave') {
            quest.state = 'dungeon_boss';
            return true;
        }
    }

    /*
     * KILL BOSS
     */
    if (
        eventType === 'KILL' &&
        stage.id === 'dungeon_boss'
    ) {
        if (eventData.target === 'boss') {
            quest.state = 'complete';
            return true;
        }
    }

    /*
     * Explicit quest start.
     */
    if (
        eventType === 'START'
    ) {
        if (
            quest.state !==
            'not_started'
        ) {
            return false;
        }

        quest.state =
            'sword';

        quest.progress = 0;

        return true;
    }

    return false;
}

export function getQuestState() {
    return ensureQuestState();
}

export function getQuestStage() {
    const quest =
        ensureQuestState();

    return getStage(
        quest.state
    );
}

export function resetQuest() {
    gameState.quest =
        createQuestState();

    return gameState.quest;
}

export function getQuestStages() {
    return [...QUEST_STAGES];
}

export function startQuest() {
    return updateQuestProgress(
        'START'
    );
}

export function progressQuest(
    type,
    data
) {
    return updateQuestProgress(
        type,
        data
    );
}
