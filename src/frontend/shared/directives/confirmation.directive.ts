import {Directive, ElementRef, EventEmitter, Inject, OnInit, Output} from '@angular/core';

@Directive({
	selector: '[confirm]'
})

export class ConfirmationDirective implements OnInit {

	@Output() confirmed = new EventEmitter<boolean>();
	@Output() declined = new EventEmitter<boolean>();

	constructor(@Inject(ElementRef) private element: ElementRef) { }

	ngOnInit(): void {
		const directive = this;
		this.element.nativeElement.onclick = () => {
			const result = confirm('Are you sure?');
			if (result) {
				directive.confirmed.emit(true);
			} else {
				directive.declined.emit(true);
			}
		};
	}
}