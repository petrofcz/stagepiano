export interface AddManualActionDecl {
	id: string;
	name: string;
}

export class AddManualAction implements AddManualActionDecl {
	static readonly type = '[Manual] Add manual';
	public constructor(public readonly id: string, public readonly name: string) { }
}

export interface AddLayerActionDecl {
	id: string;
	name: string;
	manualId: string;
	availableVstIds: string[];
	position: number;   // 0-based
}

export class AddLayerAction implements AddLayerActionDecl {
	static readonly type = '[Manual] Add layer';
	// tslint:disable-next-line:max-line-length
	public constructor(public readonly id: string, public readonly name: string, public readonly manualId: string, public readonly availableVstIds: string[], public readonly position: number) { }
}

export interface SelectLayerActionDecl {
	layerId: string;
}

export class SelectLayerAction implements SelectLayerActionDecl {
	static readonly type = '[Manual] Select layer';
	public constructor(public readonly layerId: string) { }
}