import { DIALOGUE_DATA, DialogueNode } from '../data/dialogue';

export class DialogueSystem {
    private currentNode: DialogueNode | null = null;
    private currentLineIndex: number = 0;

    public startDialogue(nodeId: string) {
        this.currentNode = DIALOGUE_DATA[nodeId] || null;
        this.currentLineIndex = 0;
    }

    public nextLine(): boolean {
        if (!this.currentNode) return false;

        this.currentLineIndex++;
        if (this.currentLineIndex >= this.currentNode.lines.length) {
            if (this.currentNode.nextId) {
                this.startDialogue(this.currentNode.nextId);
                return true;
            } else {
                this.currentNode = null;
                return false; // Dialogue ended
            }
        }
        return true;
    }

    public getCurrentLine() {
        if (!this.currentNode) return null;
        return this.currentNode.lines[this.currentLineIndex];
    }

    public isActive(): boolean {
        return this.currentNode !== null;
    }
}

export const dialogueSystem = new DialogueSystem();
