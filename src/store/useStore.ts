import { create } from 'zustand'

// أنواع المستخدمين
export type UserType = 'security_employee' | 'interview_manager' | 'admin'

// واجهة المستخدم
export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  department: string
  createdAt: string
}

// واجهة المرشح
export interface Candidate {
  id: string
  name: string
  nationalId: string
  birthDate: string
  governorate: string
  qualification: string
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
  securityCompany: string
  position?: string
  offerDate: string
  offerResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
  status: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
  createdBy: string
  notes?: string
  workShift?: 'نهار' | 'ليل'
  createdAt: string
  updatedAt: string
  isRejectedBefore?: boolean
  previousRejectionDate?: string
}

// واجهة قاعدة البيانات المحفوظة
export interface SavedCandidate {
  id: string
  name: string
  nationalId: string
  birthDate: string
  governorate: string
  qualification: string
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
  securityCompany: string
  position?: string
  offerDate: string
  finalResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة'
  decisionDate: string
  decisionBy: string
  notes?: string
  workShift?: 'نهار' | 'ليل'
  exclusionReason?: string
  resignationReason?: string
  isRejectedBefore: boolean
  previousRejectionDate?: string
  createdAt: string
}

// واجهة الإشعارات
export interface Notification {
  id: string
  type: 'rejected_before' | 'new_candidate' | 'decision_made'
  title: string
  message: string
  candidateId: string
  candidateName: string
  isRead: boolean
  createdAt: string
}

// واجهة المقابلة
export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  position: string
  date: string
  time: string
  status: 'مجدولة' | 'مكتملة' | 'ملغاة'
  notes: string
  interviewer: string
  createdAt: string
  updatedAt: string
}

// إحصائيات لوحة التحكم
export interface DashboardStats {
  totalCandidates: number
  pendingInterviews: number
  completedInterviews: number
  hiredCandidates: number
  rejectedCandidates: number
}

// حالة التطبيق
export interface AppState {
  // بيانات المستخدمين
  users: User[]
  currentUser: User | null
  
  // بيانات المرشحين
  candidates: Candidate[]
  
  // قاعدة البيانات المحفوظة
  savedCandidates: SavedCandidate[]
  
  // الإشعارات
  notifications: Notification[]
  
  // بيانات المقابلات
  interviews: Interview[]
  
  // إحصائيات
  stats: DashboardStats
  
  // حالة الواجهة
  isLoading: boolean
  isInitialized: boolean
  
  // الإجراءات
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
  updateCandidateStatus: (id: string, status: Candidate['status'], offerResult: Candidate['offerResult']) => void
  deleteCandidate: (id: string) => void
  saveCandidateToDatabase: (candidate: Candidate, finalResult: 'مقبول' | 'مرفوض' | 'مستبعد' | 'استقالة', notes?: string, workShift?: 'نهار' | 'ليل', exclusionReason?: string, resignationReason?: string) => Promise<void>
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  getCandidatesByStatus: (status: Candidate['status']) => Candidate[]
  searchCandidates: (query: string) => Candidate[]
  searchSavedCandidates: (query: string) => SavedCandidate[]
  searchSavedCandidatesByCompany: (company: string) => SavedCandidate[]
  getSavedCandidatesByResult: (result: 'مقبول' | 'مرفوض' | 'مستبعد') => SavedCandidate[]
  deleteSavedCandidate: (id: string) => Promise<void>
  deleteMultipleSavedCandidates: (ids: string[]) => Promise<void>
  removeDuplicateSavedCandidates: () => Promise<number>
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (id: string) => void
  getUnreadNotifications: () => Notification[]
  checkRejectedBefore: (nationalId: string) => { isRejected: boolean; date?: string }
  initializeDemoData: () => void
  resetData: () => void
  restoreUserSession: () => boolean
  saveUserSession: (user: User) => void
  bulkAddCandidates: (candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => Promise<{ success: number; failed: number; errors: string[] }>
  bulkAddSavedCandidates: (candidates: Omit<SavedCandidate, 'id' | 'createdAt'>[]) => Promise<{ success: number; failed: number; errors: string[] }>
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void
  }

// تحميل البيانات الأولية من localStorage
const loadInitialState = () => {
  try {
    const candidates = localStorage.getItem('interview_candidates')
    const interviews = localStorage.getItem('interview_interviews')
    const savedCandidates = localStorage.getItem('interview_savedCandidates')
      const notifications = localStorage.getItem('interview_notifications')
    
    return {
      candidates: candidates ? JSON.parse(candidates) : [],
      savedCandidates: savedCandidates ? JSON.parse(savedCandidates) : [],
      notifications: notifications ? JSON.parse(notifications) : [],
      interviews: interviews ? JSON.parse(interviews) : []
    }
  } catch (error) {
    console.error('Error loading initial state:', error)
    return {
      candidates: [],
      savedCandidates: [],
      notifications: [],
      interviews: []
    }
  }
}

const initialState = loadInitialState()

// إنشاء المتجر مع البيانات المحملة
export const useStore = create<AppState>()(
  (set, get) => ({
      // البيانات الأولية المحملة من localStorage
      users: [],
      currentUser: null,
      candidates: initialState.candidates,
      savedCandidates: initialState.savedCandidates,
      notifications: initialState.notifications,
      interviews: initialState.interviews,
      stats: {
        totalCandidates: initialState.candidates.length,
        pendingInterviews: initialState.interviews.filter((i: Interview) => i.status === 'مجدولة').length,
        completedInterviews: initialState.interviews.filter((i: Interview) => i.status === 'مكتملة').length,
        hiredCandidates: initialState.savedCandidates.filter((c: SavedCandidate) => c.finalResult === 'مقبول').length,
        rejectedCandidates: initialState.savedCandidates.filter((c: SavedCandidate) => c.finalResult === 'مرفوض').length
      },
      isLoading: false,
      isInitialized: false,

      // تسجيل الدخول
      login: async (email: string, password: string) => {
        console.log('🔐 [STORE] بدء تسجيل الدخول...')
        console.log('📧 [STORE] البريد الإلكتروني:', email)
        console.log('🔑 [STORE] كلمة المرور:', password)
        
        const { users } = get()
        console.log('👥 [STORE] المستخدمون المتاحون:', users.map(u => u.email))
        
        // البحث عن المستخدم
        const user = users.find(u => u.email === email)
        console.log('✅ [STORE] تم العثور على المستخدم:', !!user)
        
        if (!user) {
          console.log('❌ [STORE] المستخدم غير موجود')
          return false
        }
        
        // قائمة كلمات المرور المحددة - محمية بمتغيرات البيئة
        const passwords: { [key: string]: string } = {
          'security@company.com': import.meta.env.VITE_SECURITY_EMPLOYEE_PASSWORD || 'Sec@135$',
          'interview@company.com': import.meta.env.VITE_INTERVIEW_MANAGER_PASSWORD || 'Man@135$',
          'admin@company.com': import.meta.env.VITE_ADMIN_PASSWORD || 'Adm@135$'
        }
        
        const expectedPassword = passwords[email]
        console.log('🔐 [STORE] كلمة المرور المتوقعة:', expectedPassword)
        console.log('🔐 [STORE] كلمة المرور المدخلة:', password)
        console.log('✅ [STORE] تطابق كلمة المرور:', expectedPassword === password)
        
        // التحقق من كلمة المرور
        if (expectedPassword === password) {
          console.log('🚀 [STORE] حفظ المستخدم في الحالة...')
          set({ currentUser: user })
          // حفظ الجلسة في localStorage
          get().saveUserSession(user)
          console.log('🎉 [STORE] تم تسجيل الدخول بنجاح!')
          console.log('👤 [STORE] المستخدم:', user.name)
          console.log('🏢 [STORE] القسم:', user.department)
          return true
        }
        
        console.log('❌ [STORE] فشل تسجيل الدخول - كلمة مرور خاطئة')
        return false
      },

      // تسجيل الخروج
      logout: () => {
        set({ currentUser: null })
        localStorage.removeItem('currentUser')
      },

      // إضافة مرشح
      addCandidate: async (candidateData) => {
        const { currentUser, savedCandidates, candidates } = get()
        if (!currentUser) return

        try {
          // فحص إذا كان المرشح مرفوض من قبل
          const rejectedBefore = savedCandidates.find(
            saved => saved.nationalId === candidateData.nationalId && saved.finalResult === 'مرفوض'
          )

          const newCandidate = {
            name: candidateData.name,
            national_id: candidateData.nationalId,
            birth_date: candidateData.birthDate,
            governorate: candidateData.governorate,
            qualification: candidateData.qualification,
            marital_status: candidateData.maritalStatus,
            security_company: candidateData.securityCompany,
            position: candidateData.position || null,
            offer_date: candidateData.offerDate,
            offer_result: candidateData.offerResult || 'في انتظار',
            status: 'جديد' as const,
            created_by: currentUser.name,
            notes: candidateData.notes || null,
            is_rejected_before: !!rejectedBefore,
            previous_rejection_date: rejectedBefore?.decisionDate || null
          }

          console.log('إضافة مرشح جديد:', newCandidate.name)

          // إضافة المرشح محلياً
          const newCandidateData = {
            id: Date.now().toString(),
            ...candidateData,
            status: 'جديد' as const,
            offerResult: 'في انتظار' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: currentUser.name
          }

          // إضافة الإشعار إذا كان مرفوض من قبل
          if (rejectedBefore) {
            const notification = {
              type: 'rejected_before' as const,
              title: 'مرشح مرفوض من قبل',
              message: `تم تسجيل مرشح جديد (${candidateData.name}) تم رفضه من قبل في ${rejectedBefore.decisionDate}`,
              candidateId: newCandidateData.id,
              candidateName: candidateData.name,
              isRead: false,
              id: Date.now().toString(),
              createdAt: new Date().toISOString()
            }
            
            get().addNotification(notification)
          }

          // تحديث الحالة المحلية
          set(state => {
            const newCandidates = [...state.candidates, newCandidateData]
            localStorage.setItem('interview_candidates', JSON.stringify(newCandidates))
            return {
              candidates: newCandidates,
              stats: {
                ...state.stats,
                totalCandidates: state.stats.totalCandidates + 1
              }
            }
          })

          console.log('تم إضافة المرشح بنجاح إلى قاعدة البيانات')
        } catch (error) {
          console.error('خطأ في إضافة المرشح:', error)
          throw error
        }
      },

      // تحديث حالة المرشح
      updateCandidateStatus: async (id, status, offerResult) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType === 'security_employee') return

        try {
          // تحديث محلياً
          set(state => {
            const updatedCandidates = state.candidates.map(candidate =>
              candidate.id === id
                ? { ...candidate, status, offerResult, updatedAt: new Date().toISOString() }
                : candidate
            )
            localStorage.setItem('interview_candidates', JSON.stringify(updatedCandidates))
            return { candidates: updatedCandidates }
          })

          // حفظ في قاعدة البيانات إذا كان القرار نهائي
          if (offerResult && ['مقبول', 'مرفوض', 'مستبعد'].includes(offerResult)) {
            const candidate = get().candidates.find(c => c.id === id)
            if (candidate) {
              await get().saveCandidateToDatabase(candidate, offerResult as 'مقبول' | 'مرفوض' | 'مستبعد')
            }
          }
        } catch (error) {
          console.error('خطأ في تحديث حالة المرشح:', error)
          throw error
        }
      },

      // حذف مرشح
      deleteCandidate: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف محلياً
          set(state => {
            const updatedCandidates = state.candidates.filter(candidate => candidate.id !== id)
            localStorage.setItem('interview_candidates', JSON.stringify(updatedCandidates))
            return {
              candidates: updatedCandidates,
              stats: {
                ...state.stats,
                totalCandidates: Math.max(0, state.stats.totalCandidates - 1)
              }
            }
          })
        } catch (error) {
          console.error('خطأ في حذف المرشح:', error)
          throw error
        }
      },

      // إضافة مقابلة
      addInterview: async (interviewData) => {
        const { currentUser } = get()
        if (!currentUser) return

        try {
          const newInterview = {
            candidate_id: interviewData.candidateId,
            candidate_name: interviewData.candidateName,
            position: interviewData.position,
            date: interviewData.date,
            time: interviewData.time,
            status: interviewData.status || 'مجدولة',
            notes: interviewData.notes || null,
            interviewer: currentUser.name
          }

          // إضافة المقابلة محلياً
          const newInterviewData: Interview = {
            id: Date.now().toString(),
            ...interviewData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          // تحديث الحالة المحلية
          set(state => {
            const updatedInterviews = [...state.interviews, newInterviewData]
            localStorage.setItem('interview_interviews', JSON.stringify(updatedInterviews))
            return { interviews: updatedInterviews }
          })
        } catch (error) {
          console.error('خطأ في إضافة المقابلة:', error)
          throw error
        }
      },

      // تحديث مقابلة
      updateInterview: (id, updates) => {
        set(state => ({
          interviews: state.interviews.map(interview =>
            interview.id === id
              ? { ...interview, ...updates, updatedAt: new Date().toISOString() }
              : interview
          )
        }))
      },

      // حذف مقابلة
      deleteInterview: (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        set(state => ({
          interviews: state.interviews.filter(interview => interview.id !== id)
        }))
      },

      // الحصول على المرشحين حسب الحالة
      getCandidatesByStatus: (status) => {
        const { candidates } = get()
        return candidates.filter(candidate => candidate.status === status)
      },

      // البحث في المرشحين
      searchCandidates: (query) => {
        const { candidates } = get()
        const lowercaseQuery = query.toLowerCase()
        return candidates.filter(candidate =>
          candidate.name.toLowerCase().includes(lowercaseQuery) ||
          candidate.nationalId.includes(query) ||
          candidate.governorate.toLowerCase().includes(lowercaseQuery) ||
          candidate.qualification.toLowerCase().includes(lowercaseQuery)
        )
      },

      // حفظ مرشح في قاعدة البيانات
      saveCandidateToDatabase: async (candidate, finalResult, notes, workShift?, exclusionReason?, resignationReason?) => {
        const { currentUser, savedCandidates } = get()
        if (!currentUser) return

        try {
          // فحص إذا كان المرشح محفوظ مسبقاً بنفس الرقم القومي
          const existingCandidate = savedCandidates.find(
            saved => saved.nationalId === candidate.nationalId
          )

          if (existingCandidate) {
            // تحديث السجل الموجود بدلاً من إنشاء سجل جديد
            const updatedCandidate = {
              name: candidate.name,
              national_id: candidate.nationalId,
              birth_date: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              marital_status: candidate.maritalStatus,
              security_company: candidate.securityCompany,
              position: candidate.position || null,
              offer_date: candidate.offerDate,
              final_result: finalResult,
              decision_date: new Date().toISOString(),
              decision_by: currentUser.name,
              notes: notes || null,
              work_shift: workShift || null,
              exclusion_reason: exclusionReason || null,
              resignation_reason: resignationReason || null,
              is_rejected_before: candidate.isRejectedBefore || false,
              previous_rejection_date: candidate.previousRejectionDate || null
            }

            // تحديث محلياً
            const updatedSavedCandidate: SavedCandidate = {
              ...existingCandidate,
              name: candidate.name,
              nationalId: candidate.nationalId,
              birthDate: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              maritalStatus: candidate.maritalStatus,
              securityCompany: candidate.securityCompany,
              position: candidate.position,
              offerDate: candidate.offerDate,
              finalResult,
              decisionDate: new Date().toISOString(),
              decisionBy: currentUser.name,
              notes: notes || '',
              workShift: workShift,
              exclusionReason: exclusionReason || '',
              resignationReason: resignationReason || ''
            }

            set(state => {
              const updated = state.savedCandidates.map(saved =>
                saved.id === existingCandidate.id ? updatedSavedCandidate : saved
              )
              localStorage.setItem('interview_savedCandidates', JSON.stringify(updated))
              return { savedCandidates: updated }
            })

            console.log('تم تحديث المرشح الموجود بدلاً من إنشاء سجل جديد')
          } else {
            // إنشاء سجل جديد إذا لم يكن موجوداً
            const savedCandidate = {
              name: candidate.name,
              national_id: candidate.nationalId,
              birth_date: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              marital_status: candidate.maritalStatus,
              security_company: candidate.securityCompany,
              position: candidate.position || null,
              offer_date: candidate.offerDate,
              final_result: finalResult,
              decision_date: new Date().toISOString(),
              decision_by: currentUser.name,
              notes: notes || null,
              work_shift: workShift || null,
              exclusion_reason: exclusionReason || null,
              resignation_reason: resignationReason || null,
              is_rejected_before: candidate.isRejectedBefore || false,
              previous_rejection_date: candidate.previousRejectionDate || null
            }

            // إضافة محلياً
            const newSavedCandidate: SavedCandidate = {
              id: Date.now().toString(),
              name: candidate.name,
              nationalId: candidate.nationalId,
              birthDate: candidate.birthDate,
              governorate: candidate.governorate,
              qualification: candidate.qualification,
              maritalStatus: candidate.maritalStatus,
              securityCompany: candidate.securityCompany,
              position: candidate.position,
              offerDate: candidate.offerDate,
              finalResult,
              decisionDate: new Date().toISOString(),
              decisionBy: currentUser.name,
              notes: notes || '',
              workShift: workShift,
              exclusionReason: exclusionReason || '',
              resignationReason: resignationReason || '',
              isRejectedBefore: candidate.isRejectedBefore || false,
              previousRejectionDate: candidate.previousRejectionDate,
              createdAt: new Date().toISOString()
            }

            set(state => {
              const updated = [...state.savedCandidates, newSavedCandidate]
              localStorage.setItem('interview_savedCandidates', JSON.stringify(updated))
              return { savedCandidates: updated }
            })

            console.log('تم إنشاء سجل جديد للمرشح')
          }
        } catch (error) {
          console.error('خطأ في حفظ المرشح:', error)
          throw error
        }
      },

      // البحث في قاعدة البيانات المحفوظة
      searchSavedCandidates: (query) => {
        const { savedCandidates } = get()
        const lowercaseQuery = query.toLowerCase()
        return savedCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(lowercaseQuery) ||
          candidate.nationalId.includes(query) ||
          candidate.governorate.toLowerCase().includes(lowercaseQuery) ||
          candidate.qualification.toLowerCase().includes(lowercaseQuery) ||
          candidate.securityCompany.toLowerCase().includes(lowercaseQuery)
        )
      },

      // البحث في قاعدة البيانات المحفوظة حسب الشركة
      searchSavedCandidatesByCompany: (company) => {
        const { savedCandidates } = get()
        const lowercaseCompany = company.toLowerCase()
        return savedCandidates.filter(candidate =>
          candidate.securityCompany.toLowerCase().includes(lowercaseCompany)
        )
      },

      // حذف مرشح من قاعدة البيانات المحفوظة
      deleteSavedCandidate: async (id) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('saved_candidates')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('خطأ في حذف المرشح المحفوظ:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: state.savedCandidates.filter(candidate => candidate.id !== id)
          }))

          console.log('تم حذف المرشح من قاعدة البيانات المحفوظة')
        } catch (error) {
          console.error('خطأ في حذف المرشح المحفوظ:', error)
          throw error
        }
      },

      // حذف عدة مرشحين من قاعدة البيانات المحفوظة
      deleteMultipleSavedCandidates: async (ids) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          // حذف من Supabase
          const { error } = await supabase
            .from('saved_candidates')
            .delete()
            .in('id', ids)

          if (error) {
            console.error('خطأ في حذف المرشحين المحفوظين:', error)
            throw error
          }

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: state.savedCandidates.filter(candidate => !ids.includes(candidate.id))
          }))

          console.log(`تم حذف ${ids.length} مرشح من قاعدة البيانات المحفوظة`)
        } catch (error) {
          console.error('خطأ في حذف المرشحين المحفوظين:', error)
          throw error
        }
      },

      // حذف البيانات المكررة من قاعدة البيانات المحفوظة
      removeDuplicateSavedCandidates: async () => {
        const { currentUser, savedCandidates } = get()
        if (!currentUser || currentUser.userType !== 'admin') return

        try {
          console.log('بدء حذف البيانات المكررة...')
          
          // تجميع المرشحين حسب الرقم القومي
          const candidatesByNationalId = new Map<string, SavedCandidate[]>()
          
          savedCandidates.forEach(candidate => {
            if (!candidatesByNationalId.has(candidate.nationalId)) {
              candidatesByNationalId.set(candidate.nationalId, [])
            }
            candidatesByNationalId.get(candidate.nationalId)!.push(candidate)
          })

          // العثور على المرشحين المكررين
          const duplicatesToRemove: string[] = []
          
          candidatesByNationalId.forEach((candidates, nationalId) => {
            if (candidates.length > 1) {
              console.log(`تم العثور على ${candidates.length} سجل مكرر للرقم القومي: ${nationalId}`)
              
              // ترتيب المرشحين حسب تاريخ الإنشاء (الأحدث أولاً)
              candidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              
              // الاحتفاظ بأحدث سجل وحذف الباقي
              const keepCandidate = candidates[0]
              const removeCandidates = candidates.slice(1)
              
              console.log(`الاحتفاظ بالسجل الأحدث: ${keepCandidate.name} (${keepCandidate.id})`)
              console.log(`حذف ${removeCandidates.length} سجل مكرر`)
              
              removeCandidates.forEach(candidate => {
                duplicatesToRemove.push(candidate.id)
              })
            }
          })

          if (duplicatesToRemove.length > 0) {
            // حذف البيانات المكررة من Supabase
            const { error } = await supabase
              .from('saved_candidates')
              .delete()
              .in('id', duplicatesToRemove)

            if (error) {
              console.error('خطأ في حذف البيانات المكررة:', error)
              throw error
            }

            // تحديث الحالة المحلية
            set(state => ({
              savedCandidates: state.savedCandidates.filter(candidate => !duplicatesToRemove.includes(candidate.id))
            }))

            console.log(`تم حذف ${duplicatesToRemove.length} سجل مكرر بنجاح`)
            return duplicatesToRemove.length
          } else {
            console.log('لا توجد بيانات مكررة للحذف')
            return 0
          }
        } catch (error) {
          console.error('خطأ في حذف البيانات المكررة:', error)
          throw error
        }
      },

      // الحصول على المرشحين المحفوظين حسب النتيجة
      getSavedCandidatesByResult: (result) => {
        const { savedCandidates } = get()
        return savedCandidates.filter(candidate => candidate.finalResult === result)
      },

      // إضافة إشعار
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }

        set(state => ({
          notifications: [...state.notifications, notification]
        }))
      },

      // تمييز الإشعار كمقروء
      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        }))
      },

      // الحصول على الإشعارات غير المقروءة
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notification => !notification.isRead)
      },

      // فحص إذا كان مرشح مرفوض من قبل
      checkRejectedBefore: (nationalId) => {
        const { savedCandidates } = get()
        const rejected = savedCandidates.find(
          candidate => candidate.nationalId === nationalId && candidate.finalResult === 'مرفوض'
        )
        return {
          isRejected: !!rejected,
          date: rejected?.decisionDate
        }
      },

      // تحميل البيانات المحلية - لا يوجد Supabase
      loadDataFromSupabase: async () => {
        try {
          console.log('تحميل البيانات المحلية...')
          // البيانات ستكون فارغة في البداية - localStorage فقط
          
          console.log('تم تحميل البيانات المحلية')
        } catch (error) {
          console.error('خطأ في تحميل البيانات:', error)
        }
      },

      restoreUserSession: () => {
        try {
          const savedUser = localStorage.getItem('currentUser')
          if (savedUser) {
            const user = JSON.parse(savedUser)
            set({ currentUser: user })
            console.log('تم استعادة جلسة المستخدم:', user.name)
            return true
          }
        } catch (error) {
          console.error('خطأ في استعادة جلسة المستخدم:', error)
          localStorage.removeItem('currentUser')
        }
        return false
      },

      // حفظ حالة المستخدم في localStorage
      saveUserSession: (user: User) => {
        try {
          localStorage.setItem('currentUser', JSON.stringify(user))
          console.log('تم حفظ جلسة المستخدم:', user.name)
        } catch (error) {
          console.error('خطأ في حفظ جلسة المستخدم:', error)
        }
      },

      // تهيئة البيانات التجريبية
      initializeDemoData: async () => {
        console.log('بدء تهيئة البيانات التجريبية...')
        
        // محاولة استعادة جلسة المستخدم أولاً
        const sessionRestored = get().restoreUserSession()
        if (sessionRestored) {
          console.log('تم استعادة جلسة المستخدم بنجاح')
        }
        
        // إنشاء المستخدمين التجريبيين دائماً
        const demoUsers: User[] = [
          {
            id: '1',
            name: 'مدير الأمن - مسئول مقابلات',
            email: 'interview@company.com',
            userType: 'interview_manager',
            department: 'إدارة الأمن',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'أدمن شركة الأمن - موظف',
            email: 'security@company.com',
            userType: 'security_employee',
            department: 'إدارة الأمن',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'أحمد حسين - الأدمن',
            email: 'admin@company.com',
            userType: 'admin',
            department: 'إدارة الأمن',
            createdAt: new Date().toISOString()
          }
        ]

        console.log('إنشاء المستخدمين التجريبيين:', demoUsers.map(u => u.email))

        // تحديث المستخدمين
        set({
          users: demoUsers,
          isInitialized: true
        })

        // لا نحتاج Supabase - البيانات محلية فقط

        console.log('تم تهيئة البيانات التجريبية بنجاح')
        console.log('المستخدمون المتاحون:', demoUsers.map(u => u.email))
      },

      // لا يوجد Supabase - هذه الوظيفة فارغة
      loadUsersFromSupabase: async () => {
        // لا يوجد Supabase
      },

      // لا يوجد Supabase
      addUserToSupabase: async (user) => {
        // فارغ - لا يوجد Supabase
      },

      // لا يوجد Supabase  
      updateUserRoleInSupabase: async (id, userType) => {
        // فارغ - لا يوجد Supabase
      },

  // إضافة عدة مرشحين من ملف Excel
  bulkAddCandidates: async (candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => {
    const { currentUser } = get()
    if (!currentUser || currentUser.userType !== 'admin') return { success: 0, failed: 0, errors: [] }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      for (const candidateData of candidates) {
        try {
          // فحص إذا كان المرشح موجود مسبقاً
          const existingCandidate = get().candidates.find(
            c => c.nationalId === candidateData.nationalId
          )

          if (existingCandidate) {
            errors.push(`المرشح ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً`)
            failedCount++
            continue
          }

          // إضافة المرشح
          await get().addCandidate(candidateData)
          successCount++
        } catch (error) {
          errors.push(`خطأ في إضافة ${candidateData.name}: ${error}`)
          failedCount++
        }
      }

      return { success: successCount, failed: failedCount, errors }
    } catch (error) {
      console.error('خطأ في إضافة المرشحين:', error)
      throw error
    }
  },

  // إضافة عدة مرشحين محفوظين من ملف Excel
  bulkAddSavedCandidates: async (candidates: Omit<SavedCandidate, 'id' | 'createdAt'>[]) => {
    const { currentUser } = get()
    if (!currentUser || currentUser.userType !== 'admin') return { success: 0, failed: 0, errors: [] }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      for (const candidateData of candidates) {
        try {
          // فحص إذا كان المرشح موجود مسبقاً
          const existingCandidate = get().savedCandidates.find(
            c => c.nationalId === candidateData.nationalId
          )

          if (existingCandidate) {
            errors.push(`المرشح المحفوظ ${candidateData.name} (الرقم القومي: ${candidateData.nationalId}) موجود مسبقاً`)
            failedCount++
            continue
          }

          // إضافة المرشح المحفوظ مباشرة إلى Supabase
          const { data, error } = await supabase
            .from('saved_candidates')
            .insert([{
              name: candidateData.name,
              national_id: candidateData.nationalId,
              birth_date: candidateData.birthDate,
              governorate: candidateData.governorate,
              qualification: candidateData.qualification,
              marital_status: candidateData.maritalStatus,
              security_company: candidateData.securityCompany,
              position: candidateData.position || null,
              offer_date: candidateData.offerDate,
              final_result: candidateData.finalResult,
              decision_date: candidateData.decisionDate,
              decision_by: candidateData.decisionBy,
              notes: candidateData.notes || null,
              is_rejected_before: candidateData.isRejectedBefore,
              previous_rejection_date: candidateData.previousRejectionDate || null
            }])
            .select()
            .single()

          if (error) {
            errors.push(`خطأ في إضافة ${candidateData.name}: ${error.message}`)
            failedCount++
            continue
          }

          // تحديث الحالة المحلية
          set(state => ({
            savedCandidates: [...state.savedCandidates, data]
          }))

          successCount++
        } catch (error) {
          errors.push(`خطأ في إضافة ${candidateData.name}: ${error}`)
          failedCount++
        }
      }

      return { success: successCount, failed: failedCount, errors }
    } catch (error) {
      console.error('خطأ في إضافة المرشحين المحفوظين:', error)
      throw error
    }
  },

      // إضافة وظيفة set للوصول المباشر
      set: set
    })
)