import {create} from 'zustand';
export const useAuth=create(set=>({user:null,token:localStorage.getItem('taskora-token'),setSession:(user,token)=>{localStorage.setItem('taskora-token',token);set({user,token});},setUser:user=>set({user}),logout:()=>{localStorage.removeItem('taskora-token');set({user:null,token:null});}}));
