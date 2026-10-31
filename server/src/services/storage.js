import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

const bucket=process.env.ATTACHMENT_S3_BUCKET;
let client;
export const attachmentStorageEnabled=()=>Boolean(bucket);
function s3(){
  if(!bucket)throw Object.assign(new Error('Persistent file storage is not configured. Ask the administrator to configure S3-compatible storage.'),{status:503});
  if(!client)client=new S3Client({region:process.env.ATTACHMENT_S3_REGION||process.env.AWS_REGION||'us-east-1',...(process.env.ATTACHMENT_S3_ENDPOINT?{endpoint:process.env.ATTACHMENT_S3_ENDPOINT,forcePathStyle:true}:{}),...(process.env.ATTACHMENT_S3_ACCESS_KEY_ID&&process.env.ATTACHMENT_S3_SECRET_ACCESS_KEY?{credentials:{accessKeyId:process.env.ATTACHMENT_S3_ACCESS_KEY_ID,secretAccessKey:process.env.ATTACHMENT_S3_SECRET_ACCESS_KEY}}:{})});
  return client;
}
export async function saveObject({key,body,contentType}){await s3().send(new PutObjectCommand({Bucket:bucket,Key:key,Body:body,ContentType:contentType,ServerSideEncryption:'AES256'}));}
export async function removeObject(key){await s3().send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}
export async function signedDownloadUrl({key,filename,contentType}){return getSignedUrl(s3(),new GetObjectCommand({Bucket:bucket,Key:key,ResponseContentDisposition:`attachment; filename="${filename.replace(/["\\\r\n]/g,'_')}"`,ResponseContentType:contentType}),{expiresIn:60});}
