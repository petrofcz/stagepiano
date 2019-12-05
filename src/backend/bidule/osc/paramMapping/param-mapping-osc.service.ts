import {Select, Store} from '@ngxs/store';
import {ParamMappingPageState} from '../../../../shared/paramMapping/state/paramMappingPage.state';
import {debounceTime, distinctUntilKeyChanged, filter, map, mergeMap, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {combineLatest, Observable, of} from 'rxjs';
import {OscService} from '../../../osc/osc.service';
import {OscMessage} from '../../../osc/osc.message';
import {SetEndpointLearningAction, UpdateParamMappingAction} from '../../../../shared/paramMapping/state/paramMappingPage.actions';
import {ParamMappingItem} from '../../../../shared/paramMapping/model/model';
import {EventEmitter, Injectable} from '@angular/core';
import {BiduleOscHelper} from '../../../../shared/bidule/osc/bidule-osc-helper';
import {StrategyHandlerProviderService} from '../../../paramMapping/model/strategyHandlerProvider.service';

@Injectable({
	providedIn: 'root'
})
export class ParamMappingOscService {

	public constructor(protected store: Store, protected osc: OscService, protected strategyHandlerProvider: StrategyHandlerProviderService) {
		this.setupEndpointLearn();
		this.setupValueLearn();
	}

	private setupEndpointLearn() {
		const isEndpointLearning$ = this.store.select(ParamMappingPageState.isEndpointLearning);

		// Endpoint learn
		const oscMessages$ = isEndpointLearning$.pipe(
			switchMap((isLearning: boolean): Observable<string> => {
				if (isLearning) {
					return this.store.select(ParamMappingPageState.getVstPathPrefix);
				} else {
					return of('');
				}
			})
		)
			.pipe(tap(val => console.log('IS EP LEARNING ' + val)))
			.pipe(filter((pathPrefix: string) => pathPrefix.length > 0))
			.pipe(switchMap(
				(pathPrefix: string) => this.osc.observeIncoming(pathPrefix + '*')
				// filter only effect's own params
					.pipe(filter(message => !BiduleOscHelper.isNativeBiduleEndpoint(message.path.split('/').pop(), false)))
					// when UI is fresh (recently opened), when any value is changed, bidule emits all param values. Need to take all changes for some time
					.pipe(debounceTime(BiduleOscHelper.TIMEOUT_OSC_PARAM_UPDATE))
					// take only one and unsubscribe
					.pipe(take(1))
			))
			.pipe(tap(val => console.log('EP OSC')))
			.subscribe((oscMessage: OscMessage) => {
				console.log(oscMessage);
				const endpoint = oscMessage.path.split('/').pop();
				this.store.dispatch(new SetEndpointLearningAction(false));
				this.store.dispatch(new UpdateParamMappingAction({
					id: this.store.selectSnapshot(ParamMappingPageState.getSelectedMapping).id,
					mainItemId: 0,
					items: [<ParamMappingItem>{
						endpoint: endpoint,
						mappingStrategy: null
					}]
				}));
			});
	}

	private setupValueLearn() {
		const learningMappingItemId$ = this.store.select(ParamMappingPageState.getLearningMappingItemId);

		this.store.select(ParamMappingPageState.getState).subscribe((state) => console.log(state));

		// Endpoint learn
		learningMappingItemId$
			.pipe(tap((val) => console.log('LEARNING MAPPING ITEM ID ' + val)))
			.pipe(
			switchMap((itemId: number|string): Observable<{path: string, paramMappingItem: ParamMappingItem}|null> => {
				return combineLatest(
						this.store.select(ParamMappingPageState.getVstPathPrefix).pipe(tap((val) => console.log('PARAM MAPPING ID ' + val))),
						this.store.select(ParamMappingPageState.getSelectedMapping).pipe(tap((val) => console.log('LEARNING SELECTED MAPPING', val)))
							.pipe(map((mapping) => itemId === null ? null : mapping.items[itemId])).pipe(tap((val) => console.log('LEARNING MAPPING ITEM', val)))
				).pipe(map((values) => { return {
						path: values[1] === null ? null : (values[0] + values[1].endpoint),
						paramMappingItem: values[1]
					};}))
				.pipe(distinctUntilKeyChanged('path'));
			})
		)
			.pipe(tap((val) => console.log('PP PPI', val)))
			.pipe(tap((val) => console.log('PP PPI', val)))
			.pipe(switchMap(
				(args) => (args === null || args.path === null) ? of(null) : this.osc.observeIncoming(args.path)
					.pipe(tap(message => console.log('PVL OSC MESSAGE', message)))
					.pipe(map(( message ) => { return { oscMessage: message, paramMappingItem: args.paramMappingItem };}))
					// filter only effect's own params
					.pipe(filter(args2 => !args2 ? false : !BiduleOscHelper.isNativeBiduleEndpoint(args2.oscMessage.path.split('/').pop(), false)))
					// // debounce too fast moves
					.pipe(debounceTime(BiduleOscHelper.TIMEOUT_OSC_VALUE_LEARN))
			))
			.pipe(tap(val => console.log('PVL FINAL', val)))
			.subscribe((args: { oscMessage: OscMessage, paramMappingItem: ParamMappingItem }) => {
				if (!args || !args.paramMappingItem.mappingStrategy) {
					return;
				}
				const handler = this.strategyHandlerProvider.get(args.paramMappingItem.mappingStrategy.type);
				if (handler) {
					handler.learnValue(
						args.oscMessage.args.length === 0 ? null : args.oscMessage.args[0],
						this.store.selectSnapshot(ParamMappingPageState.getLearningMappingItemId)
					);
				}
			});
	}
}