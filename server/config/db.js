import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: uri.split('/').pop() });
  console.log('database connected');
}