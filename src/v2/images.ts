const loadWithImageElement=(file:File)=>new Promise<HTMLImageElement>((resolve,reject)=>{
  const url=URL.createObjectURL(file);
  const image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("This photo format could not be decoded. Try a JPEG, PNG, or WebP image."))};
  image.src=url;
});

async function decodeImage(file:File):Promise<ImageBitmap|HTMLImageElement>{
  if("createImageBitmap"in window){
    try{return await createImageBitmap(file)}catch{/* Some phone JPEGs decode only through an image element. */}
  }
  return loadWithImageElement(file);
}

const canvasBlob=(canvas:HTMLCanvasElement,quality:number)=>new Promise<Blob>((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not compress this photo.")),"image/jpeg",quality);
});

export function compressionDimensions(sourceWidth:number,sourceHeight:number,maxDimension=1600):number[]{
  const sourceDimension=Math.max(sourceWidth,sourceHeight);
  if(!Number.isFinite(sourceDimension)||sourceDimension<=0)return[];
  const floor=Math.min(640,sourceDimension);
  const dimensions:number[]=[];
  let dimension=Math.min(maxDimension,sourceDimension);
  while(dimension>=floor){
    dimensions.push(dimension);
    if(dimension===floor)break;
    dimension=Math.max(floor,Math.floor(dimension*.8));
  }
  return dimensions;
}

export async function compressImage(file:File,maxDimension=1600,targetBytes=700_000):Promise<File>{
  if(!file.type.startsWith("image/"))throw new Error("Choose an image file.");
  if(/hei[cf]/i.test(file.type)||/\.hei[cf]$/i.test(file.name))throw new Error("This HEIC photo cannot be prepared in this browser yet. Export it as JPEG, PNG, or WebP and try again.");
  if(file.size>25_000_000)throw new Error("This photo is too large to prepare safely. Choose one under 25 MB.");
  let source:ImageBitmap|HTMLImageElement;
  try{source=await decodeImage(file)}catch(error){throw error instanceof Error?error:new Error("This photo could not be decoded. Try a JPEG, PNG, or WebP image.")}
  const sourceWidth=source.width,sourceHeight=source.height;
  if(!sourceWidth||!sourceHeight)throw new Error("This photo has invalid dimensions.");
  const canvas=document.createElement("canvas");
  const context=canvas.getContext("2d");
  if(!context)throw new Error("Image processing is unavailable in this browser.");
  let blob:Blob|null=null;
  try{
    for(const dimension of compressionDimensions(sourceWidth,sourceHeight,maxDimension)){
      const ratio=Math.min(1,dimension/Math.max(sourceWidth,sourceHeight));
      canvas.width=Math.max(1,Math.round(sourceWidth*ratio));
      canvas.height=Math.max(1,Math.round(sourceHeight*ratio));
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(source,0,0,canvas.width,canvas.height);
      for(let quality=.84;quality>=.44;quality-=.08){blob=await canvasBlob(canvas,quality);if(blob.size<=targetBytes)break}
      if(blob&&blob.size<=targetBytes)break;
    }
    if(!blob||blob.size>targetBytes)throw new Error("This photo is too complex to prepare safely. Try a smaller image.");
    return new File([blob],crypto.randomUUID()+".jpg",{type:"image/jpeg"});
  }finally{
    context.clearRect(0,0,canvas.width,canvas.height);canvas.width=1;canvas.height=1;
    if("close"in source&&typeof source.close==="function")source.close();
  }
}
