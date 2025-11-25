import axios, { type AxiosResponse } from 'axios';

import {BaseURL} from '@/services/config'
import type { Receipt, ReceiptItem  } from '@/types/recipt';

export const findOneReceipt = async ( id:any, headers:any): Promise<Receipt> => {
    const response: AxiosResponse<Receipt> = await axios.get(`${BaseURL}/findOneReceipt/${id}`, { headers: headers }  );
    return response.data; // Assuming the response contains the token
};

export const getReceipt = async ( params:any, headers:any): Promise<Receipt[]> => {
    const response: AxiosResponse<Receipt[]> = await axios.get(`${BaseURL}/getReceipt`,{params:params, headers: headers }  );
    return response.data; // Assuming the response contains the token
};

export const saveReceipt = async ( param:Receipt, headers:any): Promise<Receipt>  => {
    const response: AxiosResponse<Receipt> = await axios.post(`${BaseURL}/saveReceipt`,param, { headers: headers }   );
    return response.data; // Assuming the response contains the token
};

export const updateReceipt = async ( param:Receipt, headers:any): Promise<Receipt>  => {
    const response: AxiosResponse<Receipt> = await axios.put(`${BaseURL}/updateReceipt`,param, { headers: headers }   );
    return response.data; // Assuming the response contains the token
};

export const deleteReceipt = async ( idOrParam:any, headers:any): Promise<{ success: boolean }>  => {
    const id = typeof idOrParam === 'object' ? idOrParam.id : idOrParam;
    const response: AxiosResponse<{ success: boolean }> = await axios.delete(`${BaseURL}/deleteReceipt${id}`,{ headers: headers } );
    return response.data; // Assuming the response contains the token
};
