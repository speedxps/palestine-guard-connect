import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Upload, FileText, UserCheck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

interface CitizenRecord {
  id: string;
  national_id: string;
  full_name: string;
  first_name?: string;
  second_name?: string;
  third_name?: string;
  family_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

const CivilRegistry = () => {
  const [citizens, setCitizens] = useState<CitizenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<CitizenRecord | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    national_id: '',
    first_name: '',
    second_name: '',
    third_name: '',
    family_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: ''
  });

  const { generateFaceEmbedding, saveFaceData } = useFaceRecognition();

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCitizens(data || []);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `citizen-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('citizen-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('citizen-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      let photoUrl = editingCitizen?.photo_url || '';
      
      if (selectedImage) {
        photoUrl = await handleImageUpload(selectedImage);
      }

      const citizenData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.second_name} ${formData.third_name} ${formData.family_name}`.trim(),
        photo_url: photoUrl
      };

      let citizenId = editingCitizen?.id;

      if (editingCitizen) {
        const { error } = await supabase
          .from('citizens')
          .update(citizenData)
          .eq('id', editingCitizen.id);
        
        if (error) throw error;
        toast.success('تم تحديث البيانات بنجاح');
      } else {
        const { data, error } = await supabase
          .from('citizens')
          .insert([citizenData])
          .select()
          .single();
        
        if (error) throw error;
        toast.success('تم إضافة المواطن بنجاح');
        citizenId = data.id;
      }

      // إذا تم رفع صورة جديدة، حساب الـ embedding وحفظه
      if (selectedImage && citizenId) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageBase64 = e.target?.result as string;
          const embeddingResult = await generateFaceEmbedding(imageBase64);
          if (embeddingResult.success && embeddingResult.embedding) {
            await saveFaceData(citizenId!, photoUrl, embeddingResult.embedding);
          }
        };
        reader.readAsDataURL(selectedImage);
      }

      setIsDialogOpen(false);
      setEditingCitizen(null);
      setSelectedImage(null);
      setFormData({
        national_id: '',
        first_name: '',
        second_name: '',
        third_name: '',
        family_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: ''
      });
      fetchCitizens();
    } catch (error) {
      console.error('Error saving citizen:', error);
      toast.error('خطأ في حفظ البيانات');
    }
  };

  const handleEdit = (citizen: CitizenRecord) => {
    setEditingCitizen(citizen);
    setFormData({
      national_id: citizen.national_id,
      first_name: citizen.first_name || '',
      second_name: citizen.second_name || '',
      third_name: citizen.third_name || '',
      family_name: citizen.family_name || '',
      date_of_birth: citizen.date_of_birth || '',
      gender: citizen.gender || '',
      phone: citizen.phone || '',
      address: citizen.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    
    try {
      const { error } = await supabase
        .from('citizens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('تم حذف السجل بنجاح');
      fetchCitizens();
    } catch (error) {
      console.error('Error deleting citizen:', error);
      toast.error('خطأ في حذف السجل');
    }
  };

  const generateReport = (citizen: CitizenRecord) => {
    const reportContent = `
      تقرير مواطن
      ===========

      الاسم الكامل: ${citizen.full_name}
      الرقم الوطني: ${citizen.national_id}
      تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}
      الجنس: ${citizen.gender || 'غير محدد'}
      الهاتف: ${citizen.phone || 'غير محدد'}
      العنوان: ${citizen.address || 'غير محدد'}

      تاريخ التسجيل: ${new Date(citizen.created_at).toLocaleDateString('ar')}
      آخر تحديث: ${new Date(citizen.updated_at).toLocaleDateString('ar')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${citizen.national_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.national_id?.includes(searchTerm) ||
    citizen.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.family_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* الكود لباقي الواجهة بدون تغيير، يشمل Card, Table, Dialog... */}
      {/* نفس الكود اللي أرسلته سابقاً مع إدراج handleSubmit المحدث أعلاه */}
    </div>
  );
};

export default CivilRegistry;
