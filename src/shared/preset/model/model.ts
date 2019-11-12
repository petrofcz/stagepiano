export interface PresetCategory {
	id: string;
	name: string;
	presetIds: string[];
}

export interface Preset {
	id: string;
	name: string;
	vstId: string;
	initStrategy: PresetInitStrategy;
	parameterMappingId: string;
	paramValues: {[key: string]: string};
	effectParamValues: {[key: string]: {[key: string]: string}};
}

export interface PresetInitStrategy {
	type;
}

export interface PCPresetInitStrategy extends PresetInitStrategy {
	type: 'PC';
	program: number;
}

export interface VstPresetInitStrategy extends PresetInitStrategy {
	type: 'PRESET';
	preset: number;
}

export interface SnapshotPresetInitStrategy extends PresetInitStrategy {
	type: 'SNAPSHOT';
	paramValues: {[key: string]: string};
}
