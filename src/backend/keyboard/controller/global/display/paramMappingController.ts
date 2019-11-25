import {MortalInterface} from '../../../model/mortalInterface';
import {KnobEvent, KnobMode, RotationKnobEvent} from '../../../hw/display/knobs';
import {KeyboardState} from '../../../../../shared/keyboard/states/keyboard.state';
import {
	auditTime,
	debounce,
	debounceTime,
	distinctUntilChanged, distinctUntilKeyChanged,
	filter,
	map,
	mapTo,
	mergeMap,
	switchMap,
	tap,
	withLatestFrom
} from 'rxjs/operators';
import {combineLatest, merge, of, Subscription} from 'rxjs';
import {RotationDirection} from '../../../common';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';
import {Store} from '@ngxs/store';
import {ParamMappingPageState} from '../../../../../shared/paramMapping/state/paramMappingPage.state';
import {ParamMapping} from '../../../../../shared/paramMapping/model/model';
import {OscService} from '../../../../osc/osc.service';
import {OscMessage} from '../../../../osc/osc.message';
import {StrategyHandlerProviderService} from '../../../../paramMapping/model/strategyHandlerProvider.service';
import {ParamMappingStrategyHandler} from '../../../../paramMapping/model/model';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ParamMappingController implements MortalInterface {

	// row that will be used for display / control (1 or 2)
	private _row = 1; // 1-indexed

	private subscriptions: Subscription[] = [];

	protected handlerByColumn: {[key: number]: ParamMappingStrategyHandler} = { };

	constructor (protected display: DisplayRegionDriver, protected store: Store, protected osc: OscService, protected pmStrategyHandlerProvider: StrategyHandlerProviderService) { }

	get row(): number {
		return this._row;
	}

	set row(value: number) {
		this._row = value;
	}

	onInit(): void {
		for (let i = 0; i < 8; i++) {
			// mapping for given column index
			const mapping$ = this.store.select(ParamMappingPageState.getAll).pipe(debounceTime(50))
				//.pipe(tap((val) => console.log('[PMC] Mappings' + i)))
				.pipe(map((paramMappings => paramMappings.length > i ? paramMappings[i] : null)))
				.pipe(distinctUntilChanged())
				//.pipe(tap((val) => console.log('[PMC] Mapping ' + i, val)))

			const paramMappingIsDisplayable = (paramMappnig: ParamMapping) => {
				return paramMappnig !== null && paramMappnig.mainItemId !== null && paramMappnig.items[paramMappnig.mainItemId].mappingStrategy !== null;
			};

			// mapping$.subscribe((val) => console.log('[PMC] Mapping',));

			// reset columns for not active mappings
			this.subscriptions.push(
				mapping$
					.pipe(filter(paramMapping => !paramMappingIsDisplayable(paramMapping)))
					.subscribe(() => {
						//console.log('[PMC] MAPPING IS NOT DISPLAYABLE ' + i);
						this.display.display.setCellContent(this._row, i + 1, null);
						this.display.knobs.setKnobValue(i + 1, 0);
						this.display.buttonMatrix.getIdsForRow(this._row).forEach(buttonId => {
							this.display.buttonMatrix.buttons.setLed(buttonId, false);
							this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
						});
					})
			);

			const mappingItem$ = mapping$
				.pipe(filter(paramMapping => paramMapping !== null))
				.pipe(filter(paramMapping => paramMappingIsDisplayable(paramMapping)))
				//.pipe(tap((val) => console.log('[PMC] Mapping IS displayable ' + i)))
				.pipe(map(paramMapping => { return {...(paramMapping.items[paramMapping.mainItemId]), paramMapping: paramMapping }; }))
				.pipe(distinctUntilChanged());
				//.pipe(tap((val) => console.log('[PMC] PMI', val)))

			this.subscriptions.push(
				mappingItem$.subscribe(paramMappingItem => {
					const handler = this.pmStrategyHandlerProvider.get(paramMappingItem.mappingStrategy.type);
					this.display.knobs.setKnobMode(
						i + 1, handler.getKnobMode(paramMappingItem.mappingStrategy)
					);
					this.handlerByColumn[i] = handler;
					this.display.buttonMatrix.buttons.setButtonEnabled(
						this.display.buttonMatrix.getButtonId(i + 1, this._row),
						true
					);
				})
			);

			const values$ =	mappingItem$
				.pipe(mergeMap(paramMappingItem => {
					return combineLatest(
						of(paramMappingItem),
						this.store.select(ParamMappingPageState.getGivenVstPathPrefixByIndex).pipe(map(callback => callback(i)))
					).pipe(map(values => { return {
						paramMappingItem: values[0],
						vstPathPrefix: values[1]
					}; } ));
				}))
				//.pipe(tap((val) => console.log('[PMC] With prefix', val)))
				.pipe(switchMap(
					args => this.osc.observeValues(args.vstPathPrefix + args.paramMappingItem.endpoint)
						.pipe(map(oscMessage => { return { oscMessage: oscMessage, paramMappingItem: args.paramMappingItem }; }))

				))
				//.pipe(tap((val) => console.log('[PMC] FINAL ' + i, val)));

			// subscribe for active mappings
			const touched$ = merge(
				this.display.knobs.onKnobTouched.pipe(filter((knobEvent: KnobEvent) => { return knobEvent.knobId === i + 1; })),
				values$.pipe(distinctUntilKeyChanged('oscMessage', (a: OscMessage, b: OscMessage) => a.args[0] === b.args[0] ))
			).pipe(mapTo(true));

			const released$ = merge(
				this.display.knobs.onKnobReleased.pipe(filter((knobEvent: KnobEvent) => { return knobEvent.knobId === i + 1; })),
				touched$
			).pipe(debounceTime(800)).pipe(mapTo(false));

			const touch$ = merge(
				touched$,
				released$
			).pipe(distinctUntilChanged());

			const final$ = combineLatest(
				values$, touch$
			)   .pipe(tap((val) => console.log('[PMC] REAL FINAL ' + i, val)))
				.subscribe(([value, touched]) => {
				const handler = this.handlerByColumn[i];
				if (touched) {
					this.display.display.setCellContent(
						this._row, i + 1,
						handler.getDisplayValue(value.paramMappingItem.mappingStrategy, value.oscMessage.args)
					);
				} else {
					this.display.display.setCellContent(this._row, i + 1, value.paramMappingItem.paramMapping.name);
				}
				this.display.knobs.setKnobValue(
					i + 1,
					handler.getKnobValue(value.paramMappingItem.mappingStrategy, value.oscMessage.args)
				);
			});

			// handle moves
			this.subscriptions.push(
				this.display.knobs.onKnobRotated
				.pipe(filter(rotationEvent => rotationEvent.knobId === (i + 1)))
				.pipe(
					withLatestFrom(values$)
				).subscribe((args) => {
					const value = args[1];
					const rotationEvent: RotationKnobEvent = <RotationKnobEvent>args[0];
					const newValue = this.handlerByColumn[i].handleMove(
						value.paramMappingItem.mappingStrategy,
						value.oscMessage.args,
						(rotationEvent.direction === RotationDirection.FORWARD ? 1 : -1) * rotationEvent.amount
					);
					this.osc.send(new OscMessage(value.oscMessage.path, [newValue]));
				})
			);

			// tslint:disable-next-line:max-line-length
			// const knobValueSelector = this.store.select(KeyboardState.knobValue).pipe(map(filterFn => filterFn(i - 1))).pipe(distinctUntilChanged()).pipe(auditTime(50));

		}

	}

	onDestroy(): void {
		// turn off all knobs
		for (let i = 1; i <= 8; i++) {
			this.display.knobs.setKnobMode(i, KnobMode.MODE_CONTINUOUS);
			this.display.knobs.setKnobValue(i, 0);
		}
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}

}