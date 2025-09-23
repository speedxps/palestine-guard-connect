import React, { useState, useCallback } from "react";
import { pipeline, env } from "@huggingface/transformers";
import { supabase } from "@/integrations/supabase/client";
import { FaceEncryption } from "@/utils/faceEncryption";

// إعداد transformers
env.allowLocalModels = false;
env.useBrowserCache = true;

interface FaceMatch {
  id: string;
  name: string;
  photoUrl: string;
}

const FaceRecognitionApp: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FaceMatch | null>(null);
  const [error, setError] = useState("");

  // صور للعرض أثناء البحث
  const imagesForAnimation = [
    "/animations/img1.png",
    "/animations/img2.png",
    "/animations/img3.png",
  ];

  // رفع الصورة
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };

  // البحث عن الوجه
  const startSearch = useCallback(async () => {
    if (!uploadedImage) {
      setError("يرجى رفع صورة أولاً!");
      return;
    }

    setSearching(true);
    setProgress(0);
    setResult(null);
    setError("");

    // بدء الانيميشن والعداد
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesForAnimation.length);
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 100);

    try {
      // تحويل الصورة إلى base64
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      const imageBase64: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      // فك تشفير الصورة إذا كان مشفر
      const decodedImage = FaceEncryption ? FaceEncryption.decrypt(imageBase64) : imageBase64;

      // إعداد pipeline التعرف على الوجه
      const facePipeline = await pipeline("face-recognition");

      const detectedFaces = await facePipeline(decodedImage);

      if (!detectedFaces || detectedFaces.length === 0) {
        throw new Error("لم يتم العثور على وجه في الصورة");
      }

      // جلب جميع صور المطلوبين من Supabase
      const { data: facesData, error: supabaseError } = await supabase
        .from("wanted_faces")
        .select("*");

      if (supabaseError) throw supabaseError;

      // مقارنة الـ embeddings
      let match: FaceMatch | null = null;
      for (const face of facesData) {
        const storedEmbedding = face.embedding; // مفترض أن كل وجه مخزن مع embedding
        const score = await compareFaces(detectedFaces[0].embedding, storedEmbedding);
        if (score > 0.8) {
          match = {
            id: face.id,
            name: face.name,
            photoUrl: face.photoUrl,
          };
          break;
        }
      }

      setResult(match || null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء البحث");
    } finally {
      clearInterval(interval);
      setSearching(false);
      setProgress(100);
    }
  }, [uploadedImage]);

  // دالة افتراضية لمقارنة embeddings
  const compareFaces = async (emb1: number[], emb2: number[]) => {
    if (emb1.length !== emb2.length) return 0;
    let sum = 0;
    for (let i = 0; i < emb1.length; i++) {
      sum += (emb1[i] - emb2[i]) ** 2;
    }
    return 1 / (1 + Math.sqrt(sum)); // يحول المسافة إلى تشابه
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>نظام التعرف على الوجوه</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />
      <button onClick={startSearch} disabled={searching} style={{ marginLeft: "10px" }}>
        {searching ? "جارٍ البحث..." : "ابحث عن الوجه"}
      </button>

      {uploadedImage && (
        <div style={{ marginTop: "20px" }}>
          <h4>الصورة المرفوعة:</h4>
          <img
            src={URL.createObjectURL(uploadedImage)}
            alt="Uploaded"
            style={{ width: "200px", border: "1px solid #ccc", padding: "5px" }}
          />
        </div>
      )}

      {searching && (
        <div style={{ marginTop: "20px" }}>
          <h4>البحث جارٍ...</h4>
          <img
            src={imagesForAnimation[currentImageIndex]}
            alt="Animation"
            style={{ width: "150px", border: "1px solid #ccc", padding: "5px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <progress value={progress} max={100} style={{ width: "200px" }} />
            <span> {progress}%</span>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h4>تم العثور على الوجه:</h4>
          <p>الاسم: {result.name}</p>
          <img src={result.photoUrl} alt={result.name} style={{ width: "200px" }} />
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FaceRecognitionApp;