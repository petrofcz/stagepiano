import {PresetSession} from '../model/presetSession';
import {Preset, PresetInitStrategy} from '../model/model';

export interface PatchCurrentPresetActionDecl {
	preset: Partial<Preset>;
}

export class PatchCurrentPresetAction implements PatchCurrentPresetActionDecl {
	static type = '[PresetSession] Patch current preset';
	constructor(public readonly preset: Partial<Preset>) { }
}

export interface PatchCurrentPresetInitStrategyActionDecl {
	initStrategy: Partial<PresetInitStrategy>;
}

export class PatchCurrentPresetInitStrategyAction implements PatchCurrentPresetInitStrategyActionDecl {
	static type = '[PresetSession] Patch current preset init strategy';
	constructor(public readonly initStrategy: Partial<PresetInitStrategy>) { }
}

export interface SelectPresetActionDecl {
	readonly presetId: string|null;
	// readonly forcePresetData?: Preset|null;
	readonly forcePresetData: Preset|null;
}
export class SelectPresetAction implements SelectPresetActionDecl {
	static readonly type = '[Session] Select preset';
	public constructor(public readonly presetId: string|null, public readonly forcePresetData: Preset|null = null) { }
}

export interface SetLearningActionDecl {
	isLearning: boolean;
}

export class SetInitVstPresetLearningAction implements SetLearningActionDecl {
	static readonly type = '[Session] Set init vst preset learning';
	constructor(public readonly isLearning: boolean) { }
}

export class SetInitSnapshotLearningAction implements SetLearningActionDecl {
	static readonly type = '[Session] Set init snapshot learning';
	constructor(public readonly isLearning: boolean) { }
}