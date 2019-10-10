import * as UrlPattern from 'url-pattern';
import * as events from 'events';

export declare interface BiduleOscAdapter {
	on(event: 'globalEffect', listener: (passthru: any, vstId: string, paramName: string) => void): this;

	on(event: 'manualVolume', listener: (passthru: any, manualId: number) => void): this;

	on(event: 'layerVolume', listener: (passthru: any, manualId: number, layerId: number) => void): this;

	on(event: 'instrumentRouting', listener: (passthru: any, manualId: number, layerId: number, instrumentPosition: number) => void): this;

	// tslint:disable-next-line:max-line-length
	on(event: 'localEffect|instrument', listener: (passthru: any, manualId: number, layerId: number, vstId: string, paramName: string) => void): this;
}

export class BiduleOscAdapter extends events.EventEmitter {

	protected globalEffectPattern = new UrlPattern('/E:vstIdRest/:paramName');
	protected manualVolumePattern = new UrlPattern('/ManualMixer/Volume_Channel_:manualId');
	protected layerVolumePattern = new UrlPattern('/Manual:manualId/LayerMixer/Volume_Channel_:layerId');
	protected instrumentRoutingPattern = new UrlPattern('/Manual:manualId/Layer:layerId/InstrumentMatrix/_In_:instrumentPosition_Out_1', {
		segmentNameCharset: 'a-zA-Z',
		segmentValueCharset: '0-9'
	});
	protected localEffectPattern = new UrlPattern('/Manual:manualId/Layer:layerId/E:vstIdRest/:paramName');
	protected instrumentPattern = new UrlPattern('/Manual:manualId/Layer:layerId/I:vstIdRest/:paramName');

	resolvePath(path: string, passthru: any) {
		let res;
		if ((res = this.globalEffectPattern.match(path))) {
			this.emit('globalEffect', passthru, 'E' + res.vstIdRest, res.paramName);
		}
		if ((res = this.manualVolumePattern.match(path))) {
			this.emit('manualVolume', passthru, res.manualId);
		}
		if ((res = this.layerVolumePattern.match(path))) {
			this.emit('layerVolume', passthru, res.manualId, res.layerId);
		}
		if ((res = this.instrumentRoutingPattern.match(path))) {
			this.emit('instrumentRouting', passthru, res.manualId, res.layerId, res.instrumentPosition);
		}
		if ((res = this.localEffectPattern.match(path))) {
			this.emit('localEffect', passthru, res.manualId, res.layerId, 'E' + res.vstIdRest, res.paramName);
		}
		if ((res = this.instrumentPattern.match(path))) {
			this.emit('instrument', passthru, res.manualId, res.layerId, 'I' + res.vstIdRest, res.paramName);
		}
	}

	getGlobalEffectPath(vstId: string, paramName: string): string {
		return this.globalEffectPattern.stringify({
			vstIdRest: vstId.substr(1),
			paramName: paramName
		});
	}

	getManualVolumePath(manualId: number): string {
		return this.manualVolumePattern.stringify({
			manualId: manualId
		});
	}

	getLayerVolumePath(manualId: number, layerId: number): string {
		return this.layerVolumePattern.stringify({
			manualId: manualId,
			layerId: layerId
		});
	}

	getInstrumentRoutingPath(manualId: number, layerId: number, instrumentPosition: number) {
		return this.instrumentRoutingPattern.stringify({
			manualId: manualId,
			layerId: layerId,
			instrumentPosition: instrumentPosition
		});
	}

	getInstrumentPath(manualId: number, layerId: number, vstId: string, paramName: string) {
		return this.globalEffectPattern.stringify({
			manualId: manualId,
			layerId: layerId,
			vstIdRest: vstId.substr(1),
			paramName: paramName
		});
	}

	getLocalEffectPath(manualId: number, layerId: number, vstId: string, paramName: string) {
		return this.globalEffectPattern.stringify({
			manualId: manualId,
			layerId: layerId,
			vstIdRest: vstId.substr(1),
			paramName: paramName
		});
	}
}

export module BiduleOSCAdapter {

	export enum CommonParam {
		MODE = 'Mode',			// value specified in Mode
		PRESET_NUMBER = 'Preset_Number',
		OPEN_UI = 'Open_UI',	// no value
		YIELD_PARAMETERS = 'parameters_osc_update',	// no value
	}

	export enum Mode {
		PROCESSING = 0,
		MUTE = 0.5,
		BYPASS = 1
	}

}
