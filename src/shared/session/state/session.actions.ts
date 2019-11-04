export interface SelectLayerActionDecl {
	layerId: string;
}

export class SelectLayerAction implements SelectLayerActionDecl {
	static readonly type = '[Manual] Select layer';
	public constructor(public readonly layerId: string) { }
}

export interface SelectPresetCategoryActionDecl {
	readonly presetCategoryId?: string;
}
export class SelectPresetCategoryAction implements SelectPresetCategoryActionDecl {
	static readonly type = '[PresetCategory] Select';
	public constructor(public readonly presetCategoryId?: string) { }
}

export interface SelectPresetActionDecl {
	readonly presetId?: string;
}
export class SelectPresetAction implements SelectPresetActionDecl {
	static readonly type = '[Preset] Select';
	public constructor(public readonly presetId?: string) { }
}
