import React, { useState, useEffect } from "react";
import { useFaceRecognition } from "@/hooks/useFaceRecognition"; // الكود القديم كـ hook

// صور للعرض أثناء البحث (مثل لعبة حجرة ورقة مقص)
const animationImages = [
  "/animations/img1.png",
  "/animations/img2.png",
  "/animations/img3.png",
];

const FaceRecognitionUI: React.FC = () => {
  const {
    searchFaces,
  } = useFaceRecognition();

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState("");

  // رفع الصورة
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
      setMatches([]);
      setError("");
    }
  };

  // بدء البحث
  const handleSearch = async () => {
    if (!uploadedImage) {
      setError("يرجى رفع صورة أولاً!");
      return;
    }

    setSearching(true);
    setProgress(0);
    setMatches([]);
    setError("");

    // إعداد الانيميشن والعداد
    const animationInterval = setInterval(() => {
      setCurrentAnimationIndex((prev) => (prev + 1) % animationImages.length);
      setProgress((prev) => Math.min(prev + 2, 100)); // تحديث تدريجي للعداد
    }, 100);

    try {
      // تحويل الصورة إلى base64
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      const imageBase64: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      // البحث عن وجوه مشابهة باستخدام الـ hook القديم
      const result = await searchFaces(imageBase64);

      if (!result.success || !result.matches || result.matches.length === 0) {
        setError("لم يتم العثور على وجه مطابق.");
      } else {
        setMatches(result.matches);
      }

    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء البحث.");
    } finally {
      clearInterval(animationInterval);
      setProgress(100);
      setSearching(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>نظام التعرف على الوجوه</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />
      <button onClick={handleSearch} disabled={searching} style={{ marginLeft: "10px" }}>
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
            src={animationImages[currentAnimationIndex]}
            alt="Animation"
            style={{ width: "150px", border: "1px solid #ccc", padding: "5px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <progress value={progress} max={100} style={{ width: "200px" }} />
            <span> {progress}%</span>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>تم العثور على الوجه:</h4>
          {matches.map((match, index) => (
            <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <p>الاسم: {match.name}</p>
              {match.nationalId && <p>الرقم الوطني: {match.nationalId}</p>}
              {match.role && <p>الوظيفة: {match.role}</p>}
              <p>درجة التشابه: {(match.similarity * 100).toFixed(2)}%</p>
              {match.photo_url && (
                <img src={match.photo_url} alt={match.name} style={{ width: "150px", border: "1px solid #ccc" }} />
              )}
            </div>
          ))}
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

export default FaceRecognitionUI;