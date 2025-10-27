import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceApiModels = async (): Promise<boolean> => {
  if (modelsLoaded) {
    console.log('✅ النماذج محملة مسبقاً');
    return true;
  }

  try {
    console.log('🔄 بدء تحميل نماذج face-api.js...');
    
    // محاولة التحميل من CDN مباشرة (أكثر موثوقية)
    const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    console.log('📡 تحميل النماذج من CDN:', CDN_URL);
    console.log('⏳ قد يستغرق التحميل بضع ثوانٍ، الرجاء الانتظار...');
    
    // تحميل النماذج الثلاثة المطلوبة
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
    ]);

    modelsLoaded = true;
    console.log('✅ تم تحميل جميع النماذج بنجاح!');
    console.log('✅ النماذج المحملة: SSD MobileNet V1, Face Landmarks 68, Face Recognition');
    console.log('💡 النماذج جاهزة للاستخدام');
    return true;
  } catch (error) {
    console.error('❌ فشل تحميل النماذج من CDN الأول، محاولة CDN بديل...');
    
    try {
      // محاولة من CDN بديل
      const BACKUP_CDN = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      console.log('📡 تحميل من CDN البديل:', BACKUP_CDN);
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(BACKUP_CDN),
        faceapi.nets.faceLandmark68Net.loadFromUri(BACKUP_CDN),
        faceapi.nets.faceRecognitionNet.loadFromUri(BACKUP_CDN),
      ]);

      modelsLoaded = true;
      console.log('✅ تم تحميل النماذج من CDN البديل بنجاح');
      return true;
    } catch (backupError) {
      console.error('❌ فشل التحميل من جميع المصادر');
      console.error('📋 تفاصيل الخطأ:', backupError);
      console.error('');
      console.error('🔧 حلول مقترحة:');
      console.error('   1. تأكد من اتصالك بالإنترنت');
      console.error('   2. حاول تحديث الصفحة (F5)');
      console.error('   3. امسح الذاكرة المؤقتة للمتصفح');
      console.error('   4. حاول استخدام متصفح مختلف');
      console.error('');
      modelsLoaded = false;
      return false;
    }
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