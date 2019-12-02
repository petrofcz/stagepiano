import {PresetSession} from '../model/presetSession';
import {Preset} from '../model/model';

export interface PatchCurrentPresetActionDecl {
	preset: Partial<Preset>;
}

export class PatchCurrentPresetAction implements PatchCurrentPresetActionDecl {
	static type = '[PresetSession] Patch current preset';
	constructor(public readonly preset: Partial<Preset>) { }
}

export interface SelectPresetActionDecl {
	readonly presetId?: string;
}
export class SelectPresetAction implements SelectPresetActionDecl {
	static readonly type = '[Session] Select preset';
	public constructor(public readonly presetId?: string) { }
}
