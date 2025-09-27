// 1️⃣ إضافة states جديدة
const [securityStatus, setSecurityStatus] = useState<{level: string, notes: string[]}>({level: 'آمن', notes: []});

// 2️⃣ دالة لجلب الحالة الأمنية للمواطن
const fetchSecurityStatus = async (citizenId: string) => {
  try {
    const { data, error } = await supabase
      .from('security_status')
      .select('*')
      .eq('citizen_id', citizenId)
      .single();
    if (error) throw error;
    setSecurityStatus({level: data.level || 'آمن', notes: data.notes || []});
  } catch (error) {
    console.error('خطأ في جلب الحالة الأمنية:', error);
  }
};

// 3️⃣ دالة لحساب إجمالي قيمة الممتلكات
const calculateTotalPropertyValue = () => {
  return properties.reduce((total, p) => total + (p.value || 0), 0);
};

// 4️⃣ تحديث دالة عرض تفاصيل المواطن لتشمل الحالة الأمنية
const viewCitizenDetails = (citizen: Citizen) => {
  setSelectedCitizen(citizen);
  fetchCitizenProperties(citizen.id);
  fetchAuditLogs(citizen.id);
  fetchSecurityStatus(citizen.id);
  setActiveTab('overview');
};

// 5️⃣ تحديث تبويب الحالة الأمنية في الـTabsContent
<TabsContent value="security" className="space-y-4">
  <Alert>
    <Shield className="h-4 w-4" />
    <AlertDescription>
      الحالة الأمنية للمواطن: 
      <Badge variant={securityStatus.level === 'خطر' ? 'destructive' : 'default'} className="mx-2">
        {securityStatus.level}
      </Badge>
    </AlertDescription>
  </Alert>
  {securityStatus.notes.length > 0 ? (
    <ul className="mt-2 list-disc list-inside">
      {securityStatus.notes.map((note, idx) => <li key={idx}>{note}</li>)}
    </ul>
  ) : (
    <p className="text-muted-foreground">لا توجد ملاحظات أمنية</p>
  )}
</TabsContent>

// 6️⃣ تحديث تبويب الممتلكات لإظهار القيمة الإجمالية
<TabsContent value="properties" className="space-y-4">
  {/* موجود المحتوى السابق لإضافة الممتلكات */}
  <p className="font-semibold mt-2">
    القيمة الإجمالية للممتلكات: {calculateTotalPropertyValue()} شيكل
  </p>
</TabsContent>

// 7️⃣ تحديث دالة generateReport لتضمين القيمة الإجمالية والحالة الأمنية
const generateReport = async (citizen: Citizen) => {
  try {
    await fetchCitizenProperties(citizen.id);
    await fetchSecurityStatus(citizen.id);

    const reportContent = `
تقرير مواطن
=============

البيانات الشخصية:
الاسم الكامل: ${citizen.full_name}
رقم الهوية: ${citizen.national_id}
اسم الأب: ${citizen.father_name || 'غير محدد'}
تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}
الجنس: ${citizen.gender === 'male' ? 'ذكر' : citizen.gender === 'female' ? 'أنثى' : 'غير محدد'}
رقم الهاتف: ${citizen.phone || 'غير محدد'}
العنوان: ${citizen.address || 'غير محدد'}

الممتلكات:
${properties.map(p => `- ${p.property_description} (${p.property_type})`).join('\n') || 'لا توجد ممتلكات مسجلة'}
القيمة الإجمالية للممتلكات: ${calculateTotalPropertyValue()} شيكل

الحالة الأمنية: ${securityStatus.level}
ملاحظات أمنية:
${securityStatus.notes.join('\n') || 'لا توجد ملاحظات'}

تاريخ الإنشاء: ${new Date(citizen.created_at).toLocaleDateString('ar-SA')}
آخر تحديث: ${citizen.last_modified_at ? new Date(citizen.last_modified_at).toLocaleDateString('ar-SA') : 'لم يتم التحديث'}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${citizen.full_name}_${citizen.national_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('تم تحميل التقرير بنجاح');
  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    toast.error('فشل في إنشاء التقرير');
  }
};
