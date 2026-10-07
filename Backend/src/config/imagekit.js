import ImageKit from 'imagekit';

let imagekit = null;

export const getImageKit = () => {
  if (imagekit) return imagekit;
  
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.log('⚠️ ImageKit not configured - using mock URLs');
    return null;
  }

  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint
  });
  return imagekit;
};

export const uploadToImageKit = async (file, fileName, folder = '/homexa') => {
  const ik = getImageKit();
  if (!ik) {
    // Mock response for development without ImageKit
    return {
      url: `https://images.unsplash.com/photo-${Math.floor(Math.random()*10000000000)}?auto=format&fit=crop&w=800`,
      fileId: `mock_${Date.now()}`,
      thumbnailUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random()*10000000000)}?auto=format&fit=crop&w=200`
    };
  }

  try {
    const result = await ik.upload({
      file: file.buffer || file, // buffer or base64
      fileName: fileName || `property_${Date.now()}`,
      folder,
      useUniqueFileName: true,
      tags: ['homexa', 'property']
    });
    return result;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Image upload failed');
  }
};

export default getImageKit;
