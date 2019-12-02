import {EffectDisposition} from '../model/effectDisposition';
import {ParamMappingPage} from '../../paramMapping/model/model';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';

export interface SelectLayerActionDecl {
	layerId: string;
}

export class SelectLayerAction implements SelectLayerActionDecl {
	static readonly type = '[Session] Select layer';
	public constructor(public readonly layerId: string) { }
}

export interface SelectPresetCategoryActionDecl {
	readonly presetCategoryId?: string;
}
export class SelectPresetCategoryAction implements SelectPresetCategoryActionDecl {
	static readonly type = '[Session] Select preset category';
	public constructor(public readonly presetCategoryId?: string) { }
}

export interface SetKeyboardRouteActionDecl {
	readonly route: KeyboardRoutes;
	readonly params: object|null;
}

export class SetKeyboardRouteAction implements SetKeyboardRouteActionDecl {
	static readonly type = '[Session] Set keyboard route';
	public constructor(public readonly route: KeyboardRoutes, public readonly params: object|null = null) { }
}

export interface SetEffectDispositionActionDecl {
	readonly disposition: EffectDisposition;
}

export class SetEffectDispositionAction implements SetEffectDispositionActionDecl {
	static readonly type = '[Session] Set effect disposition';
	// __nf = not-forward flag
	public constructor(public readonly disposition: EffectDisposition, public __nf = false) { }
}

export interface SetParamMappingPageActionDecl {
	readonly page: ParamMappingPage;
}

// deprecated - param mapping has its own state
export class SetParamMappingPageAction implements SetParamMappingPageActionDecl {
	static readonly type = '[Session] Set param mapping page';
	public constructor(public readonly page: ParamMappingPage) { }
}

export interface TakeEffectSnapshotActionDecl {
	readonly id: string|null;
	readonly vstPath: string|null;
}

export class TakeEffectSnapshotAction implements TakeEffectSnapshotActionDecl {
	static readonly type = '[Session] Take effect snapshot';
	constructor(public readonly id: string|null, public readonly vstPath: string|null) { }
}

export interface SetEditingActionDecl {
	readonly editing: boolean;
}

export class SetEditingAction implements SetEditingActionDecl {
	static readonly type = '[Session] Set editing';
	constructor(public readonly editing: boolean) { }
}