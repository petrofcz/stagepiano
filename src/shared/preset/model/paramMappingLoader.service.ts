import {Store} from '@ngxs/store';
import {combineLatest} from 'rxjs';
import {SessionState} from '../../session/state/session.state';
import {PresetSessionState} from '../state/presetSession.state';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {LoadParamMappingPageFromInstrumentAction, ResetParamMappingPageAction} from '../../paramMapping/state/paramMappingPage.actions';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ParamMappingLoaderService {
	constructor(protected store: Store) {
		combineLatest(
			store.select(SessionState.getActiveLayerId),
			store.select(PresetSessionState.getCurrentPreset)
				.pipe(map(preset => { return !preset ? null : {vstId: preset.vstId, mappingGroupId: preset.parameterMappingGroupId}; }))
		).pipe(distinctUntilChanged()).subscribe(([activeLayerId, currentPresetData]) => {
			if (!activeLayerId || !currentPresetData) {
				store.dispatch(new ResetParamMappingPageAction());
			} else {
				store.dispatch(new LoadParamMappingPageFromInstrumentAction(
					currentPresetData.vstId, currentPresetData.mappingGroupId
				));
			}
		});
	}
}