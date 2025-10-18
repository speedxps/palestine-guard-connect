import React, { useState } from "react";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { supabase } from "@/integrations/supabase/client";
import "./FaceRecognitionUI.css";

const animationImages = [
  "/animations/img1.png",
  "/animations/img2.png",
  "/animations/img3.png",
  "/animations/img4.png",
  "/animations/img5.png",
];

const FaceRecognitionUI: React.FC = () => {
  const { searchFaces } = useFaceRecognition();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [fakeCitizenImages, setFakeCitizenImages] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
      setMatches([]);
      setError("");
      setProgress(0);
    }
  };

  const handleSearch = async () => {
    if (!uploadedImage) {
      setError("يرجى رفع صورة أولاً!");
      return;
    }

    setSearching(true);
    setProgress(0);
    setMatches([]);
    setError("");

    // توليد 100 صورة وهمية
    const fakeImages = Array.from({ length: 100 }, (_, i) => 
      `https://i.pravatar.cc/300?img=${(i % 70) + 1}&random=${Math.random()}`
    );
    setFakeCitizenImages(fakeImages);

    let imageCounter = 0;
    const animationInterval = setInterval(() => {
      if (imageCounter < fakeImages.length) {
        setCurrentAnimationIndex(imageCounter);
        imageCounter++;
        setProgress(Math.min((imageCounter / fakeImages.length) * 100, 95));
      }
    }, 40);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      const imageBase64: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      const result = await searchFaces(imageBase64);

      // انتظار انتهاء الأنيميشن
      await new Promise(resolve => setTimeout(resolve, 4000));
      clearInterval(animationInterval);
      setProgress(100);

      if (!result.success || !result.matches || result.matches.length === 0) {
        setError(result.error || "لم يتم العثور على وجه مطابق.");
      } else {
        setMatches(result.matches);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء البحث.");
      clearInterval(animationInterval);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="face-ui-container">
      <h2>نظام التعرف على الوجوه</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />
      <button onClick={handleSearch} disabled={searching} className="search-btn">
        {searching ? "جارٍ البحث..." : "ابحث عن الوجه"}
      </button>

      {uploadedImage && (
        <div className="uploaded-section">
          <h4>الصورة المرفوعة:</h4>
          <img
            src={URL.createObjectURL(uploadedImage)}
            alt="Uploaded"
            className="uploaded-image"
          />
        </div>
      )}

      {searching && (
        <div className="searching-section">
          <h4>البحث جارٍ...</h4>
          {fakeCitizenImages.length > 0 && fakeCitizenImages[currentAnimationIndex] && (
            <img
              src={fakeCitizenImages[currentAnimationIndex]}
              alt="جاري البحث"
              className="animated-image"
            />
          )}
          <div className="progress-wrapper">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{progress}%</span>
          </div>
          <p className="text-sm text-muted">يتم فحص آلاف الصور في قاعدة البيانات...</p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="results-section">
          <h4>تم العثور على الوجه:</h4>
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <p>الاسم: {match.name}</p>
              {match.nationalId && <p>الرقم الوطني: {match.nationalId}</p>}
              {match.role && <p>الوظيفة: {match.role}</p>}
              <p>درجة التشابه: {(match.similarity * 100).toFixed(2)}%</p>
              {match.photo_url && (
                <img src={match.photo_url} alt={match.name} className="match-image" />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default FaceRecognitionUI;
