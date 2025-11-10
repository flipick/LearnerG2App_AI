// src/app/services/vertex-rag.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VertexRagService {
  // This will be updated to your RAG Server URL when deployed
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    console.log('VertexRagService initialized with API URL:', this.apiUrl);
  }

  // Upload a document to the RAG system
  uploadDocument(file: File): Observable<any> {
    console.log('VertexRagService: Starting upload for file:', file.name, 'size:', file.size, 'type:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('VertexRagService: FormData created with file appended');
    console.log('VertexRagService: Sending request to:', `${this.apiUrl}/upload`);
    
    return this.http.post<any>(`${this.apiUrl}/upload`, formData)
      .pipe(
        tap(response => {
          console.log('VertexRagService: Upload success response:', response);
        }),
        catchError(error => {
          console.error('VertexRagService: Upload error:', error);
          return this.handleError<any>('uploadDocument')(error);
        })
      );
  }

  // Query the RAG system
  queryRag(query: string): Observable<any> {
    console.log('VertexRagService: Querying RAG system with:', query);
    console.log('VertexRagService: Sending request to:', `${this.apiUrl}/query`);
    
    return this.http.post<any>(`${this.apiUrl}/query`, { query })
      .pipe(
        tap(response => {
          console.log('VertexRagService: Query success response:', response);
        }),
        catchError(error => {
          console.error('VertexRagService: Query error:', error);
          return this.handleError<any>('queryRag')(error);
        })
      );
  }

  // Error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`VertexRagService: ${operation} failed:`, error);
      
      if (error.status) {
        console.error(`VertexRagService: HTTP Status: ${error.status}`);
      }
      
      if (error.error) {
        console.error('VertexRagService: Error details:', error.error);
      }
      
      // Return a safe result to keep the application running
      return of(result as T);
    };
  }
}