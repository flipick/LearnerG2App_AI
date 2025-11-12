import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdaptiveLearning } from './adaptive-learning';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AdaptiveLearning', () => {
  let component: AdaptiveLearning;
  let fixture: ComponentFixture<AdaptiveLearning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        AdaptiveLearning
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 }) // Mock route params
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdaptiveLearning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more tests as needed
});