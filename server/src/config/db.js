import mongoose from 'mongoose';
let cached = globalThis.__taskoraMongo;
export async function connectDB(){
  if(mongoose.connection.readyState===1) return mongoose.connection;
  if(cached) return cached;
  if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  cached=mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000}).then(m=>m.connection);
  globalThis.__taskoraMongo=cached;
  try{return await cached;}catch(e){cached=undefined;globalThis.__taskoraMongo=undefined;throw e;}
}
