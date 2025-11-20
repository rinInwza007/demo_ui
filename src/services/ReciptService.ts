import axios from 'axios';

import {BaseURL} from '@/services/config'
import type { Receipt  } from '@/types/recipt';

export const FindOneRecipt = async ( id:any) => {
    const response = await axios.get(`${BaseURL}/GetOneRecipt/${id}` );
    return response.data; // Assuming the response contains the token
};

export const GetRecipt = async ( param:any) => {
    const response = await axios.get(`${BaseURL}/GetRecipt`,param  );
    return response.data; // Assuming the response contains the token
};

export const SaveRecipt = async ( param:Receipt, credentials:any) => {
    const response = await axios.post(`${BaseURL}/SaveRecipt`,param, { headers: credentials }   );
    return response.data; // Assuming the response contains the token
};

export const updateRecipt = async ( param:Receipt, credentials:any) => {
    const response = await axios.put(`${BaseURL}/UpdateRecipt`,param, { headers: credentials }   );
    return response.data; // Assuming the response contains the token
};

export const DeleteRecipt = async ( param:any) => {
    const response = await axios.delete(`${BaseURL}/DelteRecipt`,param );
    return response.data; // Assuming the response contains the token
};
