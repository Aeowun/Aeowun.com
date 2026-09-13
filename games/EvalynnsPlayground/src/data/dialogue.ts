export interface DialogueLine {
    speaker: string;
    text: string;
}

export interface DialogueNode {
    id: string;
    lines: DialogueLine[];
    nextId?: string;
}

export const DIALOGUE_DATA: Record<string, DialogueNode> = {
    'sam_greet': {
        id: 'sam_greet',
        lines: [
            { speaker: 'Shopkeeper Sam', text: 'Hello there, little explorer!' },
            { speaker: 'Shopkeeper Sam', text: 'Welcome to my humble shop. Need some seeds?' }
        ]
    },
    'martha_greet': {
        id: 'martha_greet',
        lines: [
            { speaker: 'Mayor Martha', text: 'Greetings, Evalynn! Is the village to your liking?' },
            { speaker: 'Mayor Martha', text: 'We are so happy to have you and the babies here.' }
        ]
    }
};
