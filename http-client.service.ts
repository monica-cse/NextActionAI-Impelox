import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response$ = this.httpService.get<T>(url, config);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response$ = this.httpService.post<T>(url, data, config);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response$ = this.httpService.put<T>(url, data, config);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response$ = this.httpService.delete<T>(url, config);
    const response = await lastValueFrom(response$);
    return response.data;
  }
}
