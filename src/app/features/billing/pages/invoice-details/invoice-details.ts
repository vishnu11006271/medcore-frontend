import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';


import { BillingService } from '../../services/billing.service';


import {
  Invoice,
  InvoiceBalance,
  InvoicePaymentHistory,
  PaymentMethod,
  RecordPaymentRequest,
  VerifyRazorpayPaymentRequest
} from '../../models/billing.model';


declare global {
  interface Window {
    Razorpay: any;
  }
}


@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly billingService = inject(BillingService);


  readonly invoice = signal<Invoice | null>(null);
  readonly balance = signal<InvoiceBalance | null>(null);
  readonly paymentHistory = signal<InvoicePaymentHistory | null>(null);


  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);


  readonly paymentMethods: PaymentMethod[] = [
    'CASH',
    'UPI',
    'CARD',
    'BANK_TRANSFER',
    'OTHER'
  ];


  paymentAmount: number | null = null;
  paymentMethod: PaymentMethod = 'CASH';
  referenceNumber = '';
  paymentNotes = '';


  private invoiceId = '';


  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') ?? '';


    if (!this.invoiceId) {
      this.errorMessage.set('Invoice ID is missing.');
      return;
    }


    this.loadInvoiceData();
  }


//   loadInvoiceData(): void {
//     this.loading.set(true);
//     this.errorMessage.set(null);


//     this.billingService.getInvoiceById(this.invoiceId).subscribe({
//       next: response => {
//         if (response.success) {
//           this.invoice.set(response.data);
//         } else {
//           this.errorMessage.set(response.message);
//         }


//         this.loading.set(false);
//       },
//       error: error => {
//         this.errorMessage.set(
//           this.getErrorMessage(error, 'Unable to load invoice.')
//         );
//         this.loading.set(false);
//       }
//     });


//     this.loadBalance();
//     this.loadPaymentHistory();
//   }


    loadInvoiceData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    let completedRequests = 0;

    const finishRequest = (): void => {
        completedRequests++;

        if (completedRequests === 3) {
        this.loading.set(false);
        }
    };

    this.billingService.getInvoiceById(this.invoiceId).subscribe({
        next: response => {
        if (response.success) {
            this.invoice.set(response.data);
        } else {
            this.errorMessage.set(response.message);
        }

        finishRequest();
        },
        error: error => {
        this.errorMessage.set(
            this.getErrorMessage(error, 'Unable to load invoice.')
        );
        finishRequest();
        }
    });

    this.billingService.getInvoiceBalance(this.invoiceId).subscribe({
        next: response => {
        if (response.success) {
            this.balance.set(response.data);
        } else {
            this.errorMessage.set(response.message);
        }

        finishRequest();
        },
        error: error => {
        this.errorMessage.set(
            this.getErrorMessage(error, 'Unable to load invoice balance.')
        );
        finishRequest();
        }
    });

    this.billingService.getInvoicePayments(this.invoiceId).subscribe({
        next: response => {
        if (response.success) {
            this.paymentHistory.set(response.data);
        } else {
            this.errorMessage.set(response.message);
        }

        finishRequest();
        },
        error: error => {
        this.errorMessage.set(
            this.getErrorMessage(error, 'Unable to load payment history.')
        );
        finishRequest();
        }
    });
    }



  loadBalance(): void {
    this.billingService.getInvoiceBalance(this.invoiceId).subscribe({
      next: response => {
        if (response.success) {
          this.balance.set(response.data);
        }
      },
      error: error => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load invoice balance.')
        );
      }
    });
  }


  loadPaymentHistory(): void {
    this.billingService.getInvoicePayments(this.invoiceId).subscribe({
      next: response => {
        if (response.success) {
          this.paymentHistory.set(response.data);
        }
      },
      error: error => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load payment history.')
        );
      }
    });
  }


  issueInvoice(): void {
    if (!this.invoice()) {
      return;
    }


    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);


    this.billingService.issueInvoice(this.invoiceId).subscribe({
      next: response => {
        this.submitting.set(false);


        if (response.success) {
          this.invoice.set(response.data);
          this.successMessage.set('Invoice issued successfully.');
          this.loadBalance();
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: error => {
        this.submitting.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to issue invoice.')
        );
      }
    });
  }


  recordManualPayment(): void {
    const currentBalance = this.balance();


    if (!currentBalance || !this.invoice()) {
      return;
    }


    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.errorMessage.set('Enter a valid payment amount.');
      return;
    }


    if (this.paymentAmount > currentBalance.balanceAmount) {
      this.errorMessage.set(
        'Payment cannot exceed the outstanding balance.'
      );
      return;
    }


    const payload: RecordPaymentRequest = {
      invoiceId: this.invoiceId,
      amount: Number(this.paymentAmount),
      method: this.paymentMethod,
      referenceNumber: this.referenceNumber.trim() || undefined,
      notes: this.paymentNotes.trim() || undefined,
      idempotencyKey: this.createIdempotencyKey()
    };


    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);


    this.billingService.recordPayment(payload).subscribe({
      next: response => {
        this.submitting.set(false);


        if (!response.success) {
          this.errorMessage.set(response.message);
          return;
        }


        this.successMessage.set('Payment recorded successfully.');


        this.paymentAmount = null;
        this.referenceNumber = '';
        this.paymentNotes = '';


        this.loadInvoiceData();
      },
      error: error => {
        this.submitting.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to record payment.')
        );
      }
    });
  }


  private createIdempotencyKey(): string {
    return globalThis.crypto?.randomUUID?.() ??
      `payment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }


  async payUsingRazorpay(): Promise<void> {
    if (this.submitting()) {
      return;
    }

    const currentBalance = this.balance();

    if (!currentBalance || currentBalance.balanceAmount <= 0) {
      this.errorMessage.set('There is no outstanding balance.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.loadRazorpayScript();

      this.billingService.createRazorpayOrder({
        invoiceId: this.invoiceId
      }).subscribe({
        next: response => {
          if (!response.success) {
            this.submitting.set(false);
            this.errorMessage.set(response.message);
            return;
          }

          const order = response.data;

          let verificationStarted = false;

          const options = {
            key: order.razorpay.keyId,
            amount: order.razorpay.amount,
            currency: order.razorpay.currency,
            name: 'Medcore HMS',
            description: `Invoice ${order.invoiceNumber}`,
            order_id: order.razorpay.orderId,

            handler: (paymentResponse: any) => {
              verificationStarted = true;

              this.verifyOnlinePayment({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature
              });
            },

            modal: {
              ondismiss: () => {
                this.submitting.set(false);

                if (!verificationStarted) {
                  this.billingService
                    .markRazorpayPaymentDismissed(
                      order.razorpay.orderId
                    )
                    .subscribe({
                      next: result => {
                        if (result.success) {
                          this.errorMessage.set(
                            'Razorpay checkout was closed.'
                          );

                          this.loadInvoiceData();
                        }
                      },
                      error: error => {
                        this.errorMessage.set(
                          this.getErrorMessage(
                            error,
                            'Checkout was closed, but payment status could not be updated. Please refresh and check payment history.'
                          )
                        );
                      }
                    });
                }
              }
            },

            theme: {
              color: '#2563eb'
            }
          };

          const checkout = new window.Razorpay(options);

          checkout.on('payment.failed', (failure: any) => {
            this.submitting.set(false);

            this.errorMessage.set(
              failure?.error?.description ||
              'Online payment failed.'
            );

            // Reconcile the failed attempt with the backend.
            this.billingService
              .markRazorpayPaymentDismissed(
                order.razorpay.orderId
              )
              .subscribe({
                next: () => this.loadInvoiceData(),
                error: () => this.loadInvoiceData()
              });
          });

          checkout.open();
        },

        error: error => {
          this.submitting.set(false);
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to create online payment order.'
            )
          );
        }
      });
    } catch {
      this.submitting.set(false);
      this.errorMessage.set(
        'Unable to load Razorpay checkout. Please try again.'
      );
    }
  }


//   private loadRazorpayScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (window.Razorpay) {
//         resolve();
//         return;
//       }


//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve();
//       script.onerror = () => reject();
//       document.body.appendChild(script);
//     });
//   }


    private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
        resolve();
        return;
        }

        const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        ) as HTMLScriptElement | null;

        if (existingScript) {
        existingScript.addEventListener('load', () => {
            window.Razorpay ? resolve() : reject();
        }, { once: true });

        existingScript.addEventListener('error', reject, { once: true });
        return;
        }

        const script = document.createElement('script');

        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => {
        window.Razorpay ? resolve() : reject();
        };

        script.onerror = reject;

        document.body.appendChild(script);
    });
    }



  private verifyOnlinePayment(
  payload: VerifyRazorpayPaymentRequest
): void {
  this.errorMessage.set(null);
  this.successMessage.set(null);

  this.billingService.verifyRazorpayPayment(payload).subscribe({
    next: response => {
      this.submitting.set(false);

      if (!response.success) {
        this.errorMessage.set(
          response.message || 'Payment verification failed.'
        );
        this.loadInvoiceData();
        return;
      }

      this.successMessage.set(
        'Online payment verified successfully.'
      );

      this.loadInvoiceData();
    },
    error: error => {
      this.submitting.set(false);

      this.errorMessage.set(
        this.getErrorMessage(
          error,
          'Payment verification failed. Check payment history before retrying.'
        )
      );

      this.loadInvoiceData();
    }
  });
}


  getPatientName(): string {
    const user = this.invoice()?.patient?.user;


    if (!user) {
      return 'N/A';
    }


    return `${user.firstName} ${user.lastName}`.trim();
  }


  getDoctorName(): string {
    const doctor = this.invoice()?.appointment?.doctor?.user;


    return doctor
      ? `${doctor.firstName} ${doctor.lastName}`.trim()
      : 'N/A';
  }


  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      fallback
    );
  }
}