import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceApiModels = async (): Promise<boolean> => {
  if (modelsLoaded) {
    console.log('✅ النماذج محملة مسبقاً');
    return true;
  }

  try {
    console.log('🔄 بدء تحميل نماذج face-api.js...');
    
    const MODEL_URL = '/models';
    
    // تحميل النماذج الثلاثة المطلوبة
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('✅ تم تحميل جميع النماذج بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحميل النماذج:', error);
    modelsLoaded = false;
    return false;
  }
};

export const isModelsLoaded = (): boolean => {
  return modelsLoaded;
};

export const extractFaceDescriptor = async (
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> => {
  try {
    if (!modelsLoaded) {
      console.warn('⚠️ النماذج غير محملة بعد');
      return null;
    }

    // كشف الوجه واستخراج descriptor
    const detection = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.warn('⚠️ لم يتم اكتشاف أي وجه في الصورة');
      return null;
    }

    console.log('✅ تم استخراج face descriptor بنجاح');
    return detection.descriptor;
  } catch (error) {
    console.error('❌ خطأ في استخراج face descriptor:', error);
    return null;
  }
};

export const extractAllFaceDescriptors = async (
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Array<{ descriptor: Float32Array; detection: faceapi.FaceDetection; landmarks: faceapi.FaceLandmarks68 }>> => {
  try {
    if (!modelsLoaded) {
      console.warn('⚠️ النماذج غير محملة بعد');
      return [];
    }

    // كشف جميع الوجوه في الصورة
    const detections = await faceapi
      .detectAllFaces(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log(`✅ تم اكتشاف ${detections.length} وجه في الصورة`);
    
    return detections.map(d => ({
      descriptor: d.descriptor,
      detection: d.detection,
      landmarks: d.landmarks
    }));
  } catch (error) {
    console.error('❌ خطأ في استخراج face descriptors:', error);
    return [];
  }
};