
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  ApiResponse,
  Invoice,
  InvoiceBalance,
  CreateInvoiceRequest,
  RecordPaymentRequest,
  CreateRazorpayOrderRequest,
  VerifyRazorpayPaymentRequest,
  InvoicePaymentHistory,
  RazorpayOrderResponse,
  RecordPaymentResponse,
} from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/billing`;

  // Get all invoices
  getInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(
      `${this.apiUrl}/invoices`
    );
  }

  // Get invoice by ID
  getInvoiceById(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(
      `${this.apiUrl}/invoices/${id}`
    );
  }


  // Get invoice PDF
  getInvoicePdf(id: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/invoices/${id}/pdf`,
      {
        responseType: 'blob'
      }
    );
  }


  // Create invoice
  createInvoice(
    payload: CreateInvoiceRequest
  ): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(
      `${this.apiUrl}/invoices`,
      payload
    );
  }

  // Issue invoice
  issueInvoice(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(
      `${this.apiUrl}/invoices/${id}/issue`,
      {}
    );
  }

  // Record manual payment
    recordPayment(
    payload: RecordPaymentRequest
    ): Observable<ApiResponse<RecordPaymentResponse>> {
    return this.http.post<ApiResponse<RecordPaymentResponse>>(
        `${this.apiUrl}/payments`,
        payload
    );
    }

    // Get payment history for an invoice
    getInvoicePayments(
    id: string
    ): Observable<ApiResponse<InvoicePaymentHistory>> {
    return this.http.get<ApiResponse<InvoicePaymentHistory>>(
        `${this.apiUrl}/invoices/${id}/payments`
    );
    }

  // Get invoice balance
  getInvoiceBalance(
    id: string
  ): Observable<ApiResponse<InvoiceBalance>> {
    return this.http.get<ApiResponse<InvoiceBalance>>(
      `${this.apiUrl}/invoices/${id}/balance`
    );
  }

  // Create Razorpay order
    createRazorpayOrder(
    payload: CreateRazorpayOrderRequest
    ): Observable<ApiResponse<RazorpayOrderResponse>> {
    return this.http.post<ApiResponse<RazorpayOrderResponse>>(
        `${this.apiUrl}/payments/razorpay/order`,
        payload
    );
    }

  // Verify Razorpay payment
  verifyRazorpayPayment(
    payload: VerifyRazorpayPaymentRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/payments/razorpay/verify`,
      payload
    );
  }

  markRazorpayPaymentDismissed(orderId: string) {
    return this.http.post<ApiResponse<{
      paymentId: string;
      status: string;
      message: string;
    }>>(
      `${this.apiUrl}/payments/razorpay/cancel`,
      { orderId }
    );
  }
}
