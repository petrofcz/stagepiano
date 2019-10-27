export interface SetAvailableGlobalEffectsActionDecl {
	readonly effectIds: string[];
}

export class SetAvailableGlobalEffectsAction implements SetAvailableGlobalEffectsActionDecl {
	static readonly type = '[Bidule] Set available global effects';
	public constructor(public readonly effectIds: string[]) { }
}