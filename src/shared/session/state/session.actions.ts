import {EffectDisposition} from '../model/effectDisposition';
import {ParamMappingPage} from '../../paramMapping/model/model';
import {KeyboardRoute} from '../../../backend/keyboard/router/keyboardRoute';

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

export interface SelectPresetActionDecl {
	readonly presetId?: string;
}
export class SelectPresetAction implements SelectPresetActionDecl {
	static readonly type = '[Session] Select preset';
	public constructor(public readonly presetId?: string) { }
}

export interface SetKeyboardRouteActionDecl {
	readonly route: KeyboardRoute;
}

export class SetKeyboardRouteAction implements SetKeyboardRouteActionDecl {
	static readonly type = '[Session] Set keyboard route';
	public constructor(public readonly route: KeyboardRoute) { }
}

export interface SetEffectDispositionActionDecl {
	readonly disposition: EffectDisposition;
}

export class SetEffectDispositionAction implements SetEffectDispositionActionDecl {
	static readonly type = '[Session] Set effect disposition';
	public constructor(public readonly disposition: EffectDisposition) { }
}

export interface SetParamMappingPageActionDecl {
	readonly page: ParamMappingPage;
}

export class SetParamMappingPageAction implements SetParamMappingPageActionDecl {
	static readonly type = '[Session] Set param mapping page';
	public constructor(public readonly page: ParamMappingPage) { }
}
