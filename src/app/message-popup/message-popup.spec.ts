import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagePopup } from './message-popup';

describe('MessagePopup', () => {
  let component: MessagePopup;
  let fixture: ComponentFixture<MessagePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
